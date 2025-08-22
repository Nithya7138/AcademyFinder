import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import Academidata from "../../../../models/Academy";
import mongoose from "mongoose";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;

    const conditions: any[] = [{ id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      conditions.push({ _id: new mongoose.Types.ObjectId(id) });
    }

    const doc = await Academidata.findOne({ $or: conditions }).lean();

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(doc, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}