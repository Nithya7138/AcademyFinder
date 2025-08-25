import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "../../../../lib/mongodb";
import Academidata from "../../../../models/Academy";
import mongoose from "mongoose";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await context.params;

    type Condition = { id: string } | { _id: mongoose.Types.ObjectId };
    const conditions: Condition[] = [{ id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      conditions.push({ _id: new mongoose.Types.ObjectId(id) });
    }

    const doc = await Academidata.findOne({ $or: conditions }).lean();

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(doc, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = (await cookies()).get("auth")?.value;
    if (auth !== "ok") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await context.params;

    const conditions: Array<{ id: string } | { _id: mongoose.Types.ObjectId }> = [{ id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      conditions.push({ _id: new mongoose.Types.ObjectId(id) });
    }

    const doc = await Academidata.findOneAndDelete({ $or: conditions });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = (await cookies()).get("auth")?.value;
    if (auth !== "ok") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await context.params;
    // Parse body as unknown first
    const body: unknown = await req.json();

    // Whitelist allowed fields for safety (typed)
    const allowed = [
      "name",
      "type",
      "phone",
      "wapsite",
      "academy_startat",
      "address",
      "average_rating",
      "artprogram",
      "sportsprogram",
      "location",
    ] as const satisfies readonly (keyof AcademyUpdate)[];

    // Types matching the Mongoose schema
    interface Address { line1: string; line2?: string; city: string; state?: string; country: string;link:string; zip?: string }
    interface ArtProgram { art_name: string; level: string; fees_per_month?: number }
    interface SportsProgram { sport_name: string; level: string; fees_per_month?: number }
    interface GeoLocation { type: 'Point'; coordinates: [number, number] }
    type AcademyUpdate = {
      id?: string;
      name?: string;
      type?: 'Art' | 'Sports';
      phone?: string;
      wapsite?: string;
      academy_startat?: Date;
      address?: Address;
      average_rating?: number;
      artprogram?: ArtProgram[];
      sportsprogram?: SportsProgram[];
      location?: GeoLocation;
    };

    const src = (body ?? {}) as Partial<AcademyUpdate>;

    // Normalize programs: coerce fees_per_month to number when provided
    const normalizeFees = (v: unknown): number | undefined => {
      const n = typeof v === 'string' ? Number(v) : v;
      return typeof n === 'number' && !Number.isNaN(n) ? n : undefined;
    };
    if (Array.isArray(src.artprogram)) {
      src.artprogram = src.artprogram.map(p => {
        const fee = (p as { fees_per_month?: unknown }).fees_per_month;
        return {
          ...p,
          fees_per_month: normalizeFees(fee),
        };
      });
    }
    if (Array.isArray(src.sportsprogram)) {
      src.sportsprogram = src.sportsprogram.map(p => {
        const fee = (p as { fees_per_month?: unknown }).fees_per_month;
        return {
          ...p,
          fees_per_month: normalizeFees(fee),
        };
      });
    }

    // Build update object from allowed keys with strict typing
    const update: Partial<AcademyUpdate> = {};
    const set = <K extends keyof AcademyUpdate>(obj: Partial<AcademyUpdate>, k: K, v: AcademyUpdate[K]) => {
      obj[k] = v;
    };
    for (const key of allowed) {
      const value = src[key];
      if (value !== undefined) {
        set(update, key, value);
      }
    }
    
    const conditions: Array<{ id: string } | { _id: mongoose.Types.ObjectId }> = [{ id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      conditions.push({ _id: new mongoose.Types.ObjectId(id) });
    }

    const doc = await Academidata.findOneAndUpdate({ $or: conditions }, { $set: update }, { new: true });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(doc, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}