import { NextResponse } from "next/server";

export function middleware(req) {
  // 1) Geolocation via Vercel
  const country = req.geo?.country
    // 2) Fallback header Vercel sets at the edge
    ?? req.headers.get("x-vercel-ip-country")
    ?? "";

  // Optional: skip checks for preview/dev if you want
  // if (process.env.VERCEL_ENV !== "production") return NextResponse.next();

  // Block UAE (AE)
  if (country.toUpperCase() === "AE") {
    // Option A: plain 403
    return new NextResponse("Access Restricted", { status: 403 });

    // Option B: redirect to a friendly page
    // return NextResponse.redirect(new URL("/blocked", req.url));
  }

  return NextResponse.next();
}

// Apply to everything except Next internals and common assets
export const config = {
  matcher: [
    // exclude _next (static files), api health, and typical public assets
    "/((?!_next/|api/health|favicon.ico|robots.txt|sitemap.xml|assets/|images/).*)",
  ],
};
