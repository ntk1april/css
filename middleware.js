import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/api/auth/login"];

  // Check if the current path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Get user from cookie or check localStorage (we'll use a custom header)
  const token = request.cookies.get("user")?.value;

  // If trying to access protected route without being logged in
  if (!isPublicPath && !token) {
    // Redirect to login page
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check role-based access for admin-only routes
  if (token) {
    try {
      const user = JSON.parse(token);
      const adminOnlyPaths = ["/components/products", "/components/members"];
      const isAdminOnlyPath = adminOnlyPaths.some((path) =>
        pathname.startsWith(path),
      );

      // If trying to access admin-only route without admin role
      if (isAdminOnlyPath && user.role !== "admin") {
        // Redirect to main page
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("Error parsing user token:", error);
    }
  }

  // If logged in and trying to access login page, redirect to main
  if (isPublicPath && token && pathname === "/login") {
    return NextResponse.redirect(new URL("/components/main", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)",
  ],
};
