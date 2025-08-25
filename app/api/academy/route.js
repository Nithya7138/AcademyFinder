

// app/api/academy/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Atlas_Db_connection from "../../../lib/mongodb";
import Academidata from "../../../models/Academy";

export async function GET(req) {
  try {
    await Atlas_Db_connection();
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    let academidata;
    if (name) {
      academidata = await Academidata.findOne({ name });
    } else {
      academidata = await Academidata.find();
    }

    return NextResponse.json(academidata, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Require auth cookie
    const auth = cookies().get("auth")?.value;
    if (auth !== "ok") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await Atlas_Db_connection();
    const body = await req.json();

    // Normalize incoming payload per schema
    const normalizeFees = (v) => {
      if (v === undefined || v === null) return undefined;
      const n = typeof v === 'string' ? Number(v) : v;
      return typeof n === 'number' && !Number.isNaN(n) ? n : undefined;
    };

    if (Array.isArray(body?.artprogram)) {
      body.artprogram = body.artprogram.map(p => ({
        ...p,
        fees_per_month: normalizeFees(p.fees_per_month),
      }));
    }
    if (Array.isArray(body?.sportsprogram)) {
      body.sportsprogram = body.sportsprogram.map(p => ({
        ...p,
        fees_per_month: normalizeFees(p.fees_per_month),
      }));
    }

    // Basic required fields presence
    if (!body?.id || !body?.name || !body?.type || !body?.phone || !body?.address?.line1 || !body?.address?.city || !body?.address?.country || !Array.isArray(body?.location?.coordinates)) {
      return NextResponse.json({ error: "Missing required fields per schema" }, { status: 422 });
    }

    const academidata = await Academidata.create(body);
    return NextResponse.json(academidata, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
export async function PUT(req) {
  try {
    // Require auth cookie
    const auth = cookies().get("auth")?.value;
    if (auth !== "ok") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await Atlas_Db_connection();
    const body = await req.json();

    // Normalize program fees
    const normalizeFees = (v) => {
      if (v === undefined || v === null) return undefined;
      const n = typeof v === 'string' ? Number(v) : v;
      return typeof n === 'number' && !Number.isNaN(n) ? n : undefined;
    };
    if (Array.isArray(body?.artprogram)) {
      body.artprogram = body.artprogram.map(p => ({ ...p, fees_per_month: normalizeFees(p.fees_per_month) }));
    }
    if (Array.isArray(body?.sportsprogram)) {
      body.sportsprogram = body.sportsprogram.map(p => ({ ...p, fees_per_month: normalizeFees(p.fees_per_month) }));
    }

    const { id } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 422 });

    const academidata = await Academidata.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      { $set: body },
      { new: true }
    );
    return NextResponse.json(academidata, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
