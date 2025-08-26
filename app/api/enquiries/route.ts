import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Enquiry from "../../../models/Enquiry";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      name,
      email,
      phone,
      interest,
      batch_time,
      academyId,
      academyName,
      type,
      programName,
      message,
    } = body || {};

    if (
      !name ||
      !email ||
      !phone ||
      !batch_time ||
      !academyId ||
      !academyName ||
      !type ||
      !programName
    ) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const created = await Enquiry.create({
      name,
      email,
      phone,
      // interest is optional now
      interest,
      batch_time,
      academyId,
      academyName,
      type,
      programName,
      message,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Failed to create enquiry";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}