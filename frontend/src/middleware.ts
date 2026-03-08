import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isAuthenticated = !!session?.user;
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const isAccountRoute = nextUrl.pathname.startsWith("/account");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isCheckoutRoute = nextUrl.pathname.startsWith("/checkout");

  if ((isAccountRoute || isCheckoutRoute) && !isAuthenticated) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl));
  }

  if (isAdminRoute && !isAdmin) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/checkout/:path*"],
};
