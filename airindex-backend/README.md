# AirIndex India — Backend

## 1. Setup
```bash
cd airindex-backend
npm install
npm start
```
Server runs at **http://localhost:5000**. A `db.json` file is auto-created on first run — that's your database. Delete it any time to reset to seed data.

Seeded logins:
- Admin → `admin@airindex.in` / `admin123`
- User  → `user@airindex.in` / `user123`

## 2. Wire up your React frontend
In your `airindex-india` project, add an API helper, e.g. `src/api.js`:

```js
const API_BASE = "http://localhost:5000/api";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}
```

### Login button
```js
const { token, user } = await apiFetch("/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password, loginAs: "user" }), // or "admin"
});
localStorage.setItem("token", token);
localStorage.setItem("user", JSON.stringify(user));
```

### User dashboard
```js
const stats = await apiFetch("/dashboard/stats");
const trend = await apiFetch("/dashboard/price-trend");
const popular = await apiFetch("/dashboard/popular-routes");
```

### Admin dashboard
```js
const overview = await apiFetch("/admin/overview");
const index2026 = await apiFetch("/admin/airfare-index");
const routes = await apiFetch("/admin/routes");
const airports = await apiFetch("/admin/airports");
```

## 3. Endpoint reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/register | – | create account |
| POST | /api/auth/login | – | returns JWT + user |
| GET | /api/auth/me | user | current user info |
| GET | /api/dashboard/stats | user | avg fare, routes tracked, flights analysed, accuracy |
| GET | /api/dashboard/price-trend | user | 6-month chart data |
| GET | /api/dashboard/popular-routes | user | route list card |
| GET | /api/flights/search?from=DEL&to=BOM | user | flight search results |
| GET/PATCH | /api/alerts | user | list / mark read |
| GET | /api/admin/overview | admin | index, active routes, airports |
| GET | /api/admin/airfare-index | admin | 2026 monthly index chart |
| GET/POST/DELETE | /api/admin/routes | admin | manage routes |
| GET | /api/admin/airports | admin | airport list |
| GET/POST | /api/admin/alerts | admin | manage alerts |
| GET | /api/admin/reports | admin | summary report |
| GET | /api/admin/users | admin | list all users |

All `admin/*` routes require a JWT from a user whose `role` is `"admin"` — the seeded admin account has this.

## 4. Notes
- CORS is pre-configured for `localhost:5173` and `5174` (your Vite ports).
- This uses a flat JSON file as storage — fine for development/demo. Swap in MongoDB/Postgres later if you need multi-user concurrency.
- Change `JWT_SECRET` in `server.js` before deploying anywhere real.
