async function apiFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(path, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(data.message || `HTTP ${res.status}`);
  }

  return res;
}

export async function getAuthUrl(redirectUrl?: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const path = redirectUrl
    ? `/auth/github?redirect_url=${encodeURIComponent(redirectUrl)}`
    : "/auth/github";
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "X-API-Version": "1" },
  });
  return res.json();
}

export async function getMe() {
  const res = await apiFetch("/api/auth/me");
  return res.json();
}

export async function listProfiles(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await apiFetch(`/api/proxy/profiles?${qs}`);
  return res.json();
}

export async function getProfile(id: string) {
  const res = await apiFetch(`/api/proxy/profiles/${id}`);
  return res.json();
}

export async function searchProfiles(q: string, page = 1, limit = 10) {
  const qs = new URLSearchParams({
    q,
    page: page.toString(),
    limit: limit.toString(),
  }).toString();
  const res = await apiFetch(`/api/proxy/profiles/search?${qs}`);
  return res.json();
}

export async function createProfile(name: string) {
  const res = await apiFetch("/api/proxy/profiles", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function deleteProfile(id: string) {
  await apiFetch(`/api/proxy/profiles/${id}`, {
    method: "DELETE",
  });
}

export async function exportProfiles(params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ format: "csv", ...params }).toString();
  const res = await apiFetch(`/api/proxy/profiles/export?${qs}`);
  return res.text();
}

export async function logout() {
  await apiFetch("/api/auth/logout", { method: "POST" });
}
