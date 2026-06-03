import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("bucketlist_token")?.value;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isApi = pathname.startsWith("/api/");
  const isImageApi = pathname.startsWith("/api/images/");

  if (isImageApi) return NextResponse.next();
  if (isApi) return NextResponse.next();

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/goals", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
