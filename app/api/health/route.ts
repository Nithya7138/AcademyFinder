import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";

export async function GET() {
  try {
    const conn = await dbConnect();
    const isConnected = !!conn?.connection?.readyState && conn.connection.readyState === 1; // 1 = connected

    return NextResponse.json(
      {
        ok: true,
        connected: isConnected,
        state: conn?.connection?.readyState ?? null,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { ok: false, connected: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}