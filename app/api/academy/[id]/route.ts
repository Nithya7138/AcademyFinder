import { NextResponse, NextRequest } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import Academidata from "../../../../models/Academy";
import mongoose from "mongoose";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

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