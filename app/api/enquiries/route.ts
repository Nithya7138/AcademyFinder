import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Enquiry from "../../../models/Enquiry";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { name, email, phone, interest, batch_time } = body || {};
    if (!name || !email || !phone || !interest || !batch_time) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const created = await Enquiry.create({ name, email, phone, interest, batch_time });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to create enquiry" }, { status: 500 });
  }
}