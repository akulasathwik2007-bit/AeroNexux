// Small helper for talking to the AirIndex India backend.
// Backend must be running (npm start inside airindex-backend) on port 5000.

const API_BASE = "https://airindex-backend.vercel.app//api";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("airindex_token");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let body = null;
  try {
    body = await res.json();
  } catch (e) {
    // no JSON body
  }

  if (!res.ok) {
    throw new Error(body?.message || `Request failed (${res.status})`);
  }

  return body;
}

export function login(email, password, loginAs) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, loginAs }),
  });
}

export function saveSession(token, user) {
  localStorage.setItem("airindex_token", token);
  localStorage.setItem("airindex_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("airindex_token");
  localStorage.removeItem("airindex_user");
}

export function getSavedUser() {
  const raw = localStorage.getItem("airindex_user");
  return raw ? JSON.parse(raw) : null;
}
