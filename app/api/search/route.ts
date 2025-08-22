import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Academidata from "../../../models/Academy";

// Type for MongoDB query object
interface SearchQuery {
  $or?: Array<{
    name?: RegExp;
    type?: RegExp;
    phone?: RegExp;
    "address.city"?: RegExp;
    "artprogram.art_name"?: RegExp;
    "sportsprogram.sport_name"?: RegExp;
  }>;
  type?: string;
  average_rating?: {
    $gte?: number;
    $lt?: number;
    $lte?: number;
  };
  location?: {
    $near: {
      $geometry: {
        type: "Point";
        coordinates: [number, number];
      };
      $maxDistance: number;
    };
  };
}

// Haversine distance in kilometers between two lat/lng points
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    // Ensure indexes (including 2dsphere) are created before geo queries
    try {
      await Academidata.init();
    } catch {}

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const type = (searchParams.get("type") || "all").trim();
    const minRating = Number(searchParams.get("minRating") || "0");
    const latRaw = searchParams.get("lat");
    const lngRaw = searchParams.get("lng");
    const radiusKm = Number(searchParams.get("radiusKm") || "0");

    // Pagination params
    const pageParam = Number(searchParams.get("page") || "1");
    const limitParam = Number(searchParams.get("limit") || "12");
    const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
    const limitRaw = Number.isFinite(limitParam) && limitParam > 0 ? Math.floor(limitParam) : 12;
    const limit = Math.max(1, Math.min(50, limitRaw)); 
    
    const skip = (page - 1) * limit;

    const query: SearchQuery = {};

    if (q) {
      const regex = new RegExp(q, "i"); 
      query.$or = [
        { name: regex },
        { type: regex },
        { phone: regex },
        { "address.city": regex },
        { "artprogram.art_name": regex },
        { "sportsprogram.sport_name": regex },
      ];
    }

    // Type filter
    if (type !== "all") {
      query.type = type; // values should be "Sports" or "Art"
    }

    // Rating bucket filter (e.g., 1 => [1.0, 1.9])
    if (!isNaN(minRating) && minRating > 0) {
      if (minRating >= 1 && minRating <= 4) {
        query.average_rating = { $gte: minRating, $lt: minRating + 1 };
      } else if (minRating === 5) {
        // Only exact 5-star ratings
        query.average_rating = { $gte: 5, $lte: 5 };
      }
    }

    // Optional nearby filter using GeoJSON Point
    let mongoQuery: SearchQuery = query;
    const lat = Number(latRaw);
    const lng = Number(lngRaw);
    const hasGeo = Number.isFinite(lat) && Number.isFinite(lng) && radiusKm > 0;
    if (hasGeo) {
      const radiusMeters = radiusKm * 1000;
      mongoQuery = {
        ...query,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: radiusMeters,
          },
        },
      };
    }

    try {
      // Main path: use MongoDB pagination
      const [results, total] = await Promise.all([
        Academidata.find(mongoQuery).skip(skip).limit(limit).lean(),
        Academidata.countDocuments(mongoQuery),
      ]);
      const totalPages = Math.max(1, Math.ceil(total / limit));
      return NextResponse.json(
        { results, page, limit, total, totalPages },
        { status: 200 }
      );
    } catch (geoErr: unknown) {
      // If geo index is missing or data lacks proper coordinates, fall back to non-geo query
      const msg =
        geoErr instanceof Error
          ? geoErr.message
          : typeof geoErr === "string"
          ? geoErr
          : "";
      const looksLikeGeoIndexIssue = /2dsphere|geoNear|index|near must be a point/i.test(msg);
      if (looksLikeGeoIndexIssue) {
        // Fallback: fetch non-geo filtered results, then if lat/lng provided, filter + sort by distance in memory
        // Narrowed type for geo operations
        type GeoDoc = { location?: { coordinates?: [number, number] } };
        const nonGeo = (await Academidata.find(query).lean()) as GeoDoc[];
        if (hasGeo) {
          const pairs = nonGeo
            .map((doc): { doc: GeoDoc; dKm: number } | null => {
              const coords = doc?.location?.coordinates;
              if (!Array.isArray(coords) || coords.length !== 2) return null;
              const dKm = haversineKm(lat, lng, coords[1], coords[0]);
              return { doc, dKm };
            })
            .filter((p): p is { doc: GeoDoc; dKm: number } => p !== null)
            .filter((p) => p.dKm <= radiusKm)
            .sort((a, b) => a.dKm - b.dKm);
          const within = pairs.map((p) => p.doc);
          const total = within.length;
          const totalPages = Math.max(1, Math.ceil(total / limit));
          const results = within.slice(skip, skip + limit);
          return NextResponse.json(
            { results, page, limit, total, totalPages },
            { status: 200 }
          );
        }
        const total = nonGeo.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const results = nonGeo.slice(skip, skip + limit);
        return NextResponse.json(
          { results, page, limit, total, totalPages },
          { status: 200 }
        );
      }
      throw geoErr;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message || "Unknown error" }, { status: 500 });
  }
}