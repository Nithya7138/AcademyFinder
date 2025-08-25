import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Academidata from "../../../models/Academy";

// Type for MongoDB query object
interface SearchQuery {
  $or?: (
    | { name: RegExp }
    | { type: RegExp }
    | { phone: RegExp }
    | { "address.city": RegExp }
    | { "artprogram.art_name": RegExp }
    | { "sportsprogram.sport_name": RegExp }
    | { artprogram: { $elemMatch: { fees_per_month: { $gte?: number; $lte?: number } } } }
    | { sportsprogram: { $elemMatch: { fees_per_month: { $gte?: number; $lte?: number } } } }
  )[];
  type?: string;
  id?: string;
  "address.state"?: RegExp | string;
  "address.country"?: RegExp | string;
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
    const sort = (searchParams.get("sort") || "relevance").trim();

    // Fee filters (only apply if provided)
    const minFeeRaw = searchParams.get("minFee");
    const maxFeeRaw = searchParams.get("maxFee");
    const hasMinFee = minFeeRaw !== null && minFeeRaw.trim() !== "" && !Number.isNaN(Number(minFeeRaw));
    const hasMaxFee = maxFeeRaw !== null && maxFeeRaw.trim() !== "" && !Number.isNaN(Number(maxFeeRaw));
    const minFeeParam = hasMinFee ? Number(minFeeRaw) : undefined;
    const maxFeeParam = hasMaxFee ? Number(maxFeeRaw) : undefined;

    // New exact/partial filters
    const idParam = (searchParams.get("id") || "").trim();
    const stateParam = (searchParams.get("state") || "").trim();
    const countryParam = (searchParams.get("country") || "").trim();

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

    // Optional: id exact filter
    if (idParam) {
      query.id = idParam;
    }

    // Optional: state/country partial filters (case-insensitive)
    if (stateParam) {
      query["address.state"] = new RegExp(stateParam, "i");
    }
    if (countryParam) {
      query["address.country"] = new RegExp(countryParam, "i");
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



    // Fee range filter across any program fee field
    if (minFeeParam !== undefined || maxFeeParam !== undefined) {
      // Match docs where any program fee is within bounds
      const feeRange: { $gte?: number; $lte?: number } = {};
      if (minFeeParam !== undefined) feeRange.$gte = minFeeParam;
      if (maxFeeParam !== undefined) feeRange.$lte = maxFeeParam;
      const feeCond = { $elemMatch: { fees_per_month: feeRange } };
      query.$or = [...(query.$or ?? []), { artprogram: feeCond }, { sportsprogram: feeCond }];
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
      // Server-side sorting
      // distance: handled by $near or by fallback path below
      // newest: created_at desc
      let sortSpec: Record<string, 1 | -1> | undefined;
      if (sort === "newest") sortSpec = { created_at: -1 };
      if (sort === "started_newest") sortSpec = { academy_startat: -1 };
      if (sort === "started_oldest") sortSpec = { academy_startat: 1 };

      const [results, total] = await Promise.all([
        (sortSpec
          ? Academidata.find(mongoQuery).sort(sortSpec)
          : Academidata.find(mongoQuery)
        ).skip(skip).limit(limit).lean(),
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
        type BaseDoc = GeoDoc & { created_at?: string | Date; academy_startat?: string | Date };
        const nonGeo = (await Academidata.find(query).lean()) as BaseDoc[];
        if (hasGeo) {
          let pairs = nonGeo
            .map((doc): { doc: BaseDoc; dKm: number } | null => {
              const coords = doc?.location?.coordinates;
              if (!Array.isArray(coords) || coords.length !== 2) return null;
              const dKm = haversineKm(lat, lng, coords[1], coords[0]);
              return { doc, dKm };
            })
            .filter((p): p is { doc: BaseDoc; dKm: number } => p !== null)
            .filter((p) => p.dKm <= radiusKm);

          if (sort === "distance") pairs = pairs.sort((a, b) => a.dKm - b.dKm);
          if (sort === "newest")
            pairs = pairs.sort((a, b) => {
              const tB = b.doc.created_at ? new Date(b.doc.created_at).getTime() : 0;
              const tA = a.doc.created_at ? new Date(a.doc.created_at).getTime() : 0;
              return tB - tA;
            });
          if (sort === "started_newest")
            pairs = pairs.sort((a, b) => {
              const tB = b.doc.academy_startat ? new Date(b.doc.academy_startat).getTime() : 0;
              const tA = a.doc.academy_startat ? new Date(a.doc.academy_startat).getTime() : 0;
              return tB - tA;
            });
          if (sort === "started_oldest")
            pairs = pairs.sort((a, b) => {
              const tB = b.doc.academy_startat ? new Date(b.doc.academy_startat).getTime() : 0;
              const tA = a.doc.academy_startat ? new Date(a.doc.academy_startat).getTime() : 0;
              return tA - tB;
            });

          const within = pairs.map((p) => p.doc);
          const total = within.length;
          const totalPages = Math.max(1, Math.ceil(total / limit));
          const results = within.slice(skip, skip + limit);
          return NextResponse.json(
            { results, page, limit, total, totalPages },
            { status: 200 }
          );
        }
        let base = nonGeo;
        if (sort === "newest")
          base = base.sort((a, b) => {
            const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
            const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
            return tB - tA;
          });
        if (sort === "started_newest")
          base = base.sort((a: BaseDoc, b: BaseDoc) => {
            const tB = b.academy_startat ? new Date(b.academy_startat).getTime() : 0;
            const tA = a.academy_startat ? new Date(a.academy_startat).getTime() : 0;
            return tB - tA;
          });
        if (sort === "started_oldest")
          base = base.sort((a: BaseDoc, b: BaseDoc) => {
            const tB = b.academy_startat ? new Date(b.academy_startat).getTime() : 0;
            const tA = a.academy_startat ? new Date(a.academy_startat).getTime() : 0;
            return tA - tB;
          });

        const total = base.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const results = base.slice(skip, skip + limit);
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