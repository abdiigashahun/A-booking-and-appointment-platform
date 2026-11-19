import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((request) => {
  const { nextUrl, auth: session } = request;
  const isLoggedIn = Boolean(session?.user);
  const isAuthPage = nextUrl.pathname === "/login" || nextUrl.pathname === "/signup";
  const isDashboard = nextUrl.pathname.startsWith("/dashboard");
  const isAdmin = nextUrl.pathname.startsWith("/admin");

  if (isAuthPage && isLoggedIn) return NextResponse.redirect(new URL("/dashboard", nextUrl));
  if ((isDashboard || isAdmin) && !isLoggedIn) return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl));
  if (isAdmin && session?.user.role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", nextUrl));
  return NextResponse.next();
});

export const config = { matcher: ["/login", "/signup", "/dashboard/:path*", "/admin/:path*"] };
