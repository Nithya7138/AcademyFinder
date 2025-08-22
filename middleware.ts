import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that require auth
const PROTECTED_PATHS = ["/academy/new"]; // add more as needed

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const authCookie = req.cookies.get("auth")?.value;
  if (authCookie === "ok") return NextResponse.next();

  // redirect to login with redirect back param
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirect", pathname + (req.nextUrl.search || ""));
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/academy/new"],
};