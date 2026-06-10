import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes, excluding /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get("admin_session")?.value;
    
    const adminEmail = process.env.ADMIN_EMAIL || "sidentity32@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "noesantara123@";
    
    const msgUint8 = new TextEncoder().encode(adminEmail + adminPassword + "noesantara-salt-2026");
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const expectedToken = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    if (session !== expectedToken) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
