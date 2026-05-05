import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  const redirectUrl = request.nextUrl.searchParams.get("redirect_url");

  if (!redirectUrl) {
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }

  const githubAuthUrl = `${API_URL}/auth/github?redirect_url=${encodeURIComponent(redirectUrl)}`;
  return NextResponse.redirect(githubAuthUrl);
}
