import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const isProduction = process.env.NODE_ENV === "production";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  let res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-API-Version": "1",
    },
  });

  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      const newAccess = data.access_token || data.data?.access_token;
      const newRefresh = data.refresh_token || data.data?.refresh_token;

      if (newAccess) {
        res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${newAccess}`,
            "X-API-Version": "1",
          },
        });

        const response = NextResponse.json(await res.json(), { status: res.status });

        response.cookies.set("access_token", newAccess, cookieOptions(180));
        if (newRefresh) {
          response.cookies.set("refresh_token", newRefresh, cookieOptions(300));
        }

        return response;
      }
    }

    const response = NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    response.cookies.delete("csrf_token");
    return response;
  }

  return NextResponse.json(await res.json(), { status: res.status });
}
