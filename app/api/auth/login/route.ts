import { NextResponse } from "next/server";

// Very basic demo auth. Replace with real user lookup.
const DEMO_USER = { username: process.env.DEMO_USER || "admin", password: process.env.DEMO_PASS || "admin123" };

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (username === DEMO_USER.username && password === DEMO_USER.password) {
      // Issue a simple auth cookie
      const res = NextResponse.json({ ok: true });
      res.cookies.set("auth", "ok", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8, // 8 hours
      });
      return res;
    }
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error:message }, { status: 400 });
  }
}