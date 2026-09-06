/**
 * AirIndex India — Backend API (single file)
 * --------------------------------------------------
 * Run:
 *   npm install
 *   npm start
 * Server runs on http://localhost:5000
 *
 * Storage: JSON file (db.json) — auto-created on first run.
 * No external database needed. Swap the db helpers for
 * MongoDB/Postgres later if you want to go further.
 * --------------------------------------------------
 */

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "airindex-india-dev-secret-change-me";
const DB_FILE = path.join(__dirname, "db.json");

// ---------------------------------------------------------------
// Tiny JSON "database" (persists across restarts, no native deps)
// ---------------------------------------------------------------
function seedData() {
  const adminPasswordHash = bcrypt.hashSync("admin123", 10);
  const userPasswordHash = bcrypt.hashSync("user123", 10);

  return {
    users: [
      {
        id: 1,
        name: "Admin",
        email: "admin@airindex.in",
        password: adminPasswordHash,
        role: "admin",
      },
      {
        id: 2,
        name: "Public User",
        email: "user@airindex.in",
        password: userPasswordHash,
        role: "user",
      },
    ],
    nextUserId: 3,
    priceTrend: [
      { month: "Apr", value: 5200 },
      { month: "May", value: 5450 },
      { month: "Jun", value: 5700 },
      { month: "Jul", value: 5900 },
      { month: "Aug", value: 6300 },
      { month: "Sep", value: 6842 },
    ],
    popularRoutes: [
      { from: "DEL", to: "BOM", label: "Delhi → Mumbai", avgFare: 5420, change: 3.2 },
      { from: "BOM", to: "BLR", label: "Mumbai → Bengaluru", avgFare: 4380, change: -2.4 },
      { from: "DEL", to: "BLR", label: "Delhi → Bengaluru", avgFare: 6120, change: 5.5 },
      { from: "HYD", to: "DEL", label: "Hyderabad → Delhi", avgFare: 5740, change: -1.5 },
    ],
    airfareTrend2026: [
      118, 121, 123, 126, 128, 131, 133, 135, 138, 140, 141, 142.68,
    ],
    routes: [
      { id: 1, from: "DEL", to: "BOM", flightsPerWeek: 210, avgFare: 5420 },
      { id: 2, from: "BOM", to: "BLR", flightsPerWeek: 180, avgFare: 4380 },
      { id: 3, from: "DEL", to: "BLR", flightsPerWeek: 150, avgFare: 6120 },
      { id: 4, from: "HYD", to: "DEL", flightsPerWeek: 140, avgFare: 5740 },
    ],
    airports: [
      { code: "DEL", name: "Indira Gandhi Intl", city: "Delhi" },
      { code: "BOM", name: "Chhatrapati Shivaji Maharaj Intl", city: "Mumbai" },
      { code: "BLR", name: "Kempegowda Intl", city: "Bengaluru" },
      { code: "HYD", name: "Rajiv Gandhi Intl", city: "Hyderabad" },
    ],
    alerts: [
      { id: 1, title: "Fare spike on DEL–BLR", severity: "high", createdAt: new Date().toISOString(), read: false },
      { id: 2, title: "New route added: HYD–GOI", severity: "low", createdAt: new Date().toISOString(), read: false },
    ],
    nextAlertId: 3,
    flights: [
      { id: 1, airline: "IndiGo", from: "DEL", to: "BOM", fare: 5200, duration: "2h 10m", stops: 0 },
      { id: 2, airline: "Air India", from: "DEL", to: "BOM", fare: 5800, duration: "2h 05m", stops: 0 },
      { id: 3, airline: "Vistara", from: "BOM", to: "BLR", fare: 4300, duration: "1h 40m", stops: 0 },
      { id: 4, airline: "SpiceJet", from: "DEL", to: "BLR", fare: 5900, duration: "2h 45m", stops: 1 },
    ],
  };
}

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = seedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (e) {
    const initial = seedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

let db = loadDB();

// ---------------------------------------------------------------
// App setup
// ---------------------------------------------------------------
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

// ---------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function adminRequired(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// ---------------------------------------------------------------
// Health check
// ---------------------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ---------------------------------------------------------------
// AUTH ROUTES
// ---------------------------------------------------------------
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email and password are required" });
  }
  const exists = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return res.status(409).json({ message: "Email already registered" });

  const newUser = {
    id: db.nextUserId++,
    name,
    email,
    password: bcrypt.hashSync(password, 10),
    role: role === "admin" ? "admin" : "user", // don't trust client blindly in production
  };
  db.users.push(newUser);
  saveDB(db);

  const token = signToken(newUser);
  res.status(201).json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password, loginAs } = req.body; // loginAs: "user" | "admin" (matches your toggle UI)
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  if (loginAs === "admin" && user.role !== "admin") {
    return res.status(403).json({ message: "This account does not have admin access" });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

app.get("/api/auth/me", authRequired, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// ---------------------------------------------------------------
// USER DASHBOARD ROUTES  (matches screenshot 3)
// ---------------------------------------------------------------
app.get("/api/dashboard/stats", authRequired, (req, res) => {
  res.json({
    averageAirfare: 6842,
    averageAirfareChangePct: -4.8,
    routesTracked: 1248,
    routesTrackedChangePct: 12.6,
    flightsAnalysed: 18420,
    flightsAnalysedChangePct: 4.9,
    priceAccuracyPct: 96.8,
  });
});

app.get("/api/dashboard/price-trend", authRequired, (req, res) => {
  res.json(db.priceTrend);
});

app.get("/api/dashboard/popular-routes", authRequired, (req, res) => {
  res.json(db.popularRoutes);
});

app.get("/api/flights/search", authRequired, (req, res) => {
  const { from, to } = req.query;
  let results = db.flights;
  if (from) results = results.filter((f) => f.from.toLowerCase() === String(from).toLowerCase());
  if (to) results = results.filter((f) => f.to.toLowerCase() === String(to).toLowerCase());
  res.json(results);
});

app.get("/api/alerts", authRequired, (req, res) => {
  res.json(db.alerts);
});

app.patch("/api/alerts/:id/read", authRequired, (req, res) => {
  const alert = db.alerts.find((a) => a.id === Number(req.params.id));
  if (!alert) return res.status(404).json({ message: "Alert not found" });
  alert.read = true;
  saveDB(db);
  res.json(alert);
});

// ---------------------------------------------------------------
// ADMIN DASHBOARD ROUTES  (matches screenshot 4)
// ---------------------------------------------------------------
app.get("/api/admin/overview", authRequired, adminRequired, (req, res) => {
  res.json({
    nationalAirfareIndex: 142.68,
    nationalAirfareIndexChangePct: 4.82,
    activeRoutes: 1284,
    activeRoutesChangePct: 8.4,
    airportsCovered: 156,
  });
});

app.get("/api/admin/airfare-index", authRequired, adminRequired, (req, res) => {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  res.json(db.airfareTrend2026.map((value, i) => ({ month: months[i], value })));
});

app.get("/api/admin/routes", authRequired, adminRequired, (req, res) => {
  res.json(db.routes);
});

app.post("/api/admin/routes", authRequired, adminRequired, (req, res) => {
  const { from, to, flightsPerWeek, avgFare } = req.body;
  if (!from || !to) return res.status(400).json({ message: "from and to are required" });
  const newRoute = {
    id: db.routes.length ? Math.max(...db.routes.map((r) => r.id)) + 1 : 1,
    from,
    to,
    flightsPerWeek: flightsPerWeek || 0,
    avgFare: avgFare || 0,
  };
  db.routes.push(newRoute);
  saveDB(db);
  res.status(201).json(newRoute);
});

app.delete("/api/admin/routes/:id", authRequired, adminRequired, (req, res) => {
  const id = Number(req.params.id);
  const before = db.routes.length;
  db.routes = db.routes.filter((r) => r.id !== id);
  if (db.routes.length === before) return res.status(404).json({ message: "Route not found" });
  saveDB(db);
  res.json({ success: true });
});

app.get("/api/admin/airports", authRequired, adminRequired, (req, res) => {
  res.json(db.airports);
});

app.get("/api/admin/alerts", authRequired, adminRequired, (req, res) => {
  res.json(db.alerts);
});

app.post("/api/admin/alerts", authRequired, adminRequired, (req, res) => {
  const { title, severity } = req.body;
  if (!title) return res.status(400).json({ message: "title is required" });
  const newAlert = {
    id: db.nextAlertId++,
    title,
    severity: severity || "low",
    createdAt: new Date().toISOString(),
    read: false,
  };
  db.alerts.push(newAlert);
  saveDB(db);
  res.status(201).json(newAlert);
});

app.get("/api/admin/reports", authRequired, adminRequired, (req, res) => {
  res.json({
    generatedAt: new Date().toISOString(),
    summary: {
      totalFlightsAnalysed: 18420,
      totalRoutes: db.routes.length,
      totalAirports: db.airports.length,
      averageFareNational: 6842,
    },
  });
});

app.get("/api/admin/users", authRequired, adminRequired, (req, res) => {
  res.json(db.users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
});

// ---------------------------------------------------------------
// 404 + error handling
// ---------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ message: `No route: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n✅ AirIndex India backend running at http://localhost:${PORT}`);
  console.log(`   Seeded logins:`);
  console.log(`     Admin -> admin@airindex.in / admin123`);
  console.log(`     User  -> user@airindex.in / user123\n`);
});
