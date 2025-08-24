import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "../../../../lib/mongodb";
import Academidata from "../../../../models/Academy";
import mongoose from "mongoose";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = cookies().get("auth")?.value;
    if (auth !== "ok") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = params;

    // Support both custom id and Mongo _id
    const conditions: any[] = [{ id }];
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