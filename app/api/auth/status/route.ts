import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const authed = (await cookies()).get("auth")?.value === "ok";
  return NextResponse.json({ authed });
}