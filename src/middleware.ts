/**
 * Middleware runs in the Edge Runtime — NO Node.js modules allowed (no pg, no bcrypt).
 * We read the JWT directly using next-auth/jwt which is edge-compatible.
 */
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Admin routes — must be logged in AND have admin role
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
      );
    }
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protected user routes — must be logged in
  const protectedPrefixes = ["/account", "/checkout", "/wishlist"];
  if (protectedPrefixes.some((p) => pathname.startsWith(p))) {
    if (!token) {
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/wishlist/:path*",
  ],
};
