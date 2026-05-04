const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch(path: string, options: FetchOptions = {}) {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    "X-API-Version": "1",
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(data.message || `HTTP ${res.status}`);
  }

  return res;
}

export async function getAuthUrl() {
  const res = await apiFetch("/auth/github");
  return res.json();
}

export async function handleCallback(code: string, state: string, code_verifier: string) {
  const res = await apiFetch(
    `/auth/github/callback?code=${code}&state=${state}&code_verifier=${code_verifier}`
  );
  return res.json();
}

export async function refreshToken(refresh_token: string) {
  const res = await apiFetch("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token }),
  });
  return res.json();
}

export async function logout(token: string, refresh_token: string) {
  await apiFetch("/auth/logout", {
    method: "POST",
    token,
    body: JSON.stringify({ refresh_token }),
  });
}

export async function getMe(token: string) {
  const res = await apiFetch("/auth/me", { token });
  return res.json();
}

export async function listProfiles(token: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await apiFetch(`/api/profiles?${qs}`, { token });
  return res.json();
}

export async function getProfile(token: string, id: string) {
  const res = await apiFetch(`/api/profiles/${id}`, { token });
  return res.json();
}

export async function searchProfiles(token: string, q: string, page = 1, limit = 10) {
  const res = await apiFetch(
    `/api/profiles/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`,
    { token }
  );
  return res.json();
}

export async function createProfile(token: string, name: string) {
  const res = await apiFetch("/api/profiles", {
    method: "POST",
    token,
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function deleteProfile(token: string, id: string) {
  await apiFetch(`/api/profiles/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function exportProfiles(token: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ format: "csv", ...params }).toString();
  const res = await apiFetch(`/api/profiles/export?${qs}`, { token });
  return res.text();
}

export { API_URL };
