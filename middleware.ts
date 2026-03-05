import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedPaths = ["/mall", "/tasks", "/orders", "/profile", "/notifications"];
const adminPaths = ["/admin", "/dashboard"];
const authPaths = ["/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  // Redirect to login if not authenticated
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (isAuthPath && isLoggedIn) {
    // Redirect authenticated users to appropriate dashboard
    return NextResponse.redirect(isAdmin ? new URL("/dashboard", req.url) : new URL("/mall", req.url));
  }

  if ((isProtectedPath || isAdminPath) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAdminPath && !isAdmin) {
    return NextResponse.redirect(new URL("/mall", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
