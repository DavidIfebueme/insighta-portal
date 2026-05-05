import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }

  try {
    const res = await fetch(`${API_URL}/auth/exchange-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
    }

    const data = await res.json();
    const accessToken = data.data?.access_token;
    const refreshToken = data.data?.refresh_token;

    if (!accessToken || !refreshToken) {
      return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
    }

    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 180,
    });

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 300,
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }
}
