const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function apiFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "X-API-Version": "1",
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(data.message || `HTTP ${res.status}`);
  }

  return res;
}

export function getLoginUrl(redirectUrl: string) {
  return `${API_URL}/auth/github?redirect_url=${encodeURIComponent(redirectUrl)}`;
}

export async function getAuthUrl(redirectUrl?: string) {
  const path = redirectUrl
    ? `/auth/github?redirect_url=${encodeURIComponent(redirectUrl)}`
    : "/auth/github";
  const res = await apiFetch(path);
  return res.json();
}

export async function getMe() {
  const res = await apiFetch("/auth/me");
  return res.json();
}

export async function listProfiles(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await apiFetch(`/api/profiles?${qs}`);
  return res.json();
}

export async function getProfile(id: string) {
  const res = await apiFetch(`/api/profiles/${id}`);
  return res.json();
}

export async function searchProfiles(q: string, page = 1, limit = 10) {
  const res = await apiFetch(
    `/api/profiles/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`
  );
  return res.json();
}

export async function createProfile(name: string) {
  const res = await apiFetch("/api/profiles", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function deleteProfile(id: string) {
  await apiFetch(`/api/profiles/${id}`, {
    method: "DELETE",
  });
}

export async function exportProfiles(params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ format: "csv", ...params }).toString();
  const res = await apiFetch(`/api/profiles/export?${qs}`);
  return res.text();
}

export async function logout() {
  await apiFetch("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refresh_token: "" }),
  });
}

export { API_URL };
