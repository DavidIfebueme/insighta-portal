import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const backendPath = path.join("/");
  const backendUrl = `${API_URL}/api/${backendPath}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "X-API-Version": "1",
  };

  let res = await fetch(backendUrl, { headers });

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
        headers.Authorization = `Bearer ${newAccess}`;
        res = await fetch(backendUrl, { headers });

        const contentType = res.headers.get("content-type") || "";
        const response = contentType.includes("text/csv")
          ? new NextResponse(res.body, { status: res.status, headers: { "content-type": "text/csv" } })
          : NextResponse.json(await res.json(), { status: res.status });

        response.cookies.set("access_token", newAccess, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: 180,
        });
        if (newRefresh) {
          response.cookies.set("refresh_token", newRefresh, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 300,
          });
        }
        return response;
      }
    }

    const response = NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("text/csv")) {
    return new NextResponse(res.body, {
      status: res.status,
      headers: { "content-type": "text/csv" },
    });
  }

  return NextResponse.json(await res.json(), { status: res.status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const backendPath = path.join("/");
  const body = await request.text();

  const res = await fetch(`${API_URL}/api/${backendPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-API-Version": "1",
    },
    body,
  });

  return NextResponse.json(await res.json(), { status: res.status });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const backendPath = path.join("/");

  const res = await fetch(`${API_URL}/api/${backendPath}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-API-Version": "1",
    },
  });

  return new NextResponse(null, { status: res.status });
}
