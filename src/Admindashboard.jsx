import { useState, Fragment } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Route,
  Plane,
  Bell,
  FileText,
  Settings,
  LogOut,
  Search,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  MapPin,
  Database,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

import "./AdminDashboard.css";

/* =========================================================
   EXPORT / DOWNLOAD HELPERS
   - CSV download works with plain data (Excel/Sheets can open it)
   - Printable report opens a formatted page and triggers the
     browser's print dialog, where "Save as PDF" is one of the
     destination options — no extra libraries required.
========================================================= */

function downloadCSV(filename, headers, rows) {
  const escapeCell = (val) => `"${String(val).replace(/"/g, '""')}"`;
  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function openPrintableReport(title, subtitle, headers, rows) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    alert("Please allow pop-ups for this site to generate the PDF report.");
    return;
  }

  const tableRows = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
    )
    .join("");

  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 40px; color: #111827; }
          h1 { margin-bottom: 4px; font-size: 22px; }
          p.subtitle { color: #4b5563; margin-top: 0; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; font-size: 12px; }
          th { background: #eef2ff; color: #1f2937; }
          tr:nth-child(even) { background: #f9fafb; }
          .footer { margin-top: 30px; font-size: 10px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="subtitle">${subtitle}</p>
        <table>
          <thead><tr>${headers
            .map((h) => `<th>${h}</th>`)
            .join("")}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
        <p class="footer">AirIndex India · Generated ${new Date().toLocaleString()}</p>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
}

function AdminDashboard({ email, onLogout }) {
  const [activePage, setActivePage] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(4);

  const recentNotifications = [
    {
      title: "Unusual fare increase",
      route: "Delhi → Mumbai",
      level: "Critical",
      time: "8 mins ago",
    },
    {
      title: "Price volatility detected",
      route: "Mumbai → Bengaluru",
      level: "Warning",
      time: "24 mins ago",
    },
    {
      title: "Data source delay",
      route: "Airport dataset",
      level: "Warning",
      time: "42 mins ago",
    },
    {
      title: "New route detected",
      route: "Delhi → Goa",
      level: "Info",
      time: "1 hour ago",
    },
  ];

  const menuItems = [
    {
      name: "Overview",
      icon: LayoutDashboard,
    },
    {
      name: "Airfare Index",
      icon: TrendingUp,
    },
    {
      name: "Route Analytics",
      icon: Route,
    },
    {
      name: "Airport Analytics",
      icon: Plane,
    },
    {
      name: "Alerts",
      icon: Bell,
    },
    {
      name: "Reports",
      icon: FileText,
    },
    {
      name: "Data Quality",
      icon: Gauge,
    },
    {
      name: "Settings",
      icon: Settings,
    },
  ];

  const handleMenuClick = (page) => {
    setActivePage(page);
    setSearchQuery("");
  };

  const searchMatches =
    searchQuery.trim().length > 0
      ? menuItems.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
      : [];

  const handleBellClick = () => {
    setNotifOpen((prev) => !prev);
    if (!notifOpen) setUnreadCount(0);
  };

  const renderContent = () => {
    switch (activePage) {
      case "Overview":
        return <Overview />;

      case "Airfare Index":
        return <AirfareIndex />;

      case "Route Analytics":
        return <RouteAnalytics />;

      case "Airport Analytics":
        return <AirportAnalytics />;

      case "Alerts":
        return <Alerts />;

      case "Reports":
        return <Reports />;

      case "Data Quality":
        return <DataQuality />;

      case "Settings":
        return <SettingsPage />;

      default:
        return <Overview />;
    }
  };

  return (
    <div className={`admin-dashboard ${theme === "light" ? "light-theme" : ""}`}>

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "open" : "closed"
        }`}
      >

        <div className="admin-brand">

          <div className="admin-brand-icon">
            <Plane size={22} />
          </div>

          {sidebarOpen && (
            <div>
              <h2>
                AIRINDEX <span>INDIA</span>
              </h2>
              <p>ADMIN CONTROL CENTER</p>
            </div>
          )}

        </div>

        <div className="sidebar-divider"></div>

        <nav className="admin-nav">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`admin-nav-item ${
                  activePage === item.name
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleMenuClick(item.name)
                }
              >
                <Icon size={19} />

                {sidebarOpen && (
                  <>
                    <span>{item.name}</span>

                    {activePage === item.name && (
                      <ChevronRight
                        className="nav-arrow"
                        size={15}
                      />
                    )}
                  </>
                )}
              </button>
            );
          })}

        </nav>

        <div className="sidebar-bottom">

          {sidebarOpen && (
            <div className="admin-security">
              <ShieldCheck size={17} />

              <div>
                <strong>Secure Access</strong>
                <span>Government Platform</span>
              </div>
            </div>
          )}

          <button
            className="logout-button"
            onClick={onLogout}
          >
            <LogOut size={18} />

            {sidebarOpen && <span>Logout</span>}
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main
        className={`admin-main ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >

        {/* TOP BAR */}

        <header className="admin-topbar">

          <div className="topbar-left">

            <button
              className="sidebar-toggle"
              onClick={() =>
                setSidebarOpen(!sidebarOpen)
              }
            >
              {sidebarOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>

            <div>
              <p className="breadcrumb">
                ADMIN / {activePage.toUpperCase()}
              </p>

              <h1>{activePage}</h1>
            </div>

          </div>

          <div className="topbar-right">

            <button
              className="theme-toggle"
              onClick={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
              title="Toggle dark / light theme"
            >
              {theme === "dark" ? (
                <Moon size={14} className="moon-icon" />
              ) : (
                <Sun size={14} />
              )}

              <span className={`theme-switch-track ${theme}`}>
                <span className="theme-switch-knob"></span>
              </span>
            </button>

            <div className="top-search" style={{ position: "relative" }}>
              <Search size={16} />
              <input
                placeholder="Search analytics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchMatches.length > 0) {
                    handleMenuClick(searchMatches[0].name);
                  }
                  if (e.key === "Escape") setSearchQuery("");
                }}
              />

              {searchQuery.trim().length > 0 && (
                <div className="search-dropdown">
                  {searchMatches.length > 0 ? (
                    searchMatches.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.name}
                          className="search-dropdown-item"
                          onClick={() => handleMenuClick(item.name)}
                        >
                          <Icon size={14} />
                          <span>{item.name}</span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="search-dropdown-empty">
                      No matching page for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <button className="top-icon" onClick={handleBellClick}>
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="notification-dot"></span>
                )}
              </button>

              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown-header">
                    <strong>Notifications</strong>
                    <button onClick={() => setNotifOpen(false)}>
                      <X size={14} />
                    </button>
                  </div>

                  <div className="notif-dropdown-list">
                    {recentNotifications.map((n) => (
                      <div
                        className={`notif-dropdown-item ${n.level.toLowerCase()}`}
                        key={n.title}
                      >
                        <strong>{n.title}</strong>
                        <span>{n.route}</span>
                        <small>{n.time}</small>
                      </div>
                    ))}
                  </div>

                  <button
                    className="notif-dropdown-viewall"
                    onClick={() => {
                      handleMenuClick("Alerts");
                      setNotifOpen(false);
                    }}
                  >
                    View all alerts
                  </button>
                </div>
              )}
            </div>

            <div className="admin-profile">

              <div className="profile-avatar">
                A
              </div>

              <div className="profile-info">
                <strong>Administrator</strong>
                <span>{email || "admin@airindex.in"}</span>
              </div>

            </div>

          </div>

        </header>

        {/* PAGE CONTENT */}

        <section className="admin-content">
          {renderContent()}
        </section>

      </main>

    </div>
  );
}


/* =========================================================
   OVERVIEW
========================================================= */

function Overview() {
  return (
    <div className="page-animation">

      <div className="welcome-row">

        <div>
          <p className="section-kicker">
            NATIONAL AIRFARE MONITORING
          </p>

          <h2>Airfare Intelligence Overview</h2>

          <p>
            Monitor airfare movements, routes and aviation
            indicators across India.
          </p>
        </div>

        <button className="refresh-btn">
          <RefreshCw size={16} />
          Refresh Data
        </button>

      </div>

      {/* KPI CARDS */}

      <div className="stats-grid">

        <StatCard
          title="National Airfare Index"
          value="142.68"
          change="+4.82%"
          positive={true}
          icon={<TrendingUp />}
        />

        <StatCard
          title="Active Routes"
          value="1,284"
          change="+8.4%"
          positive={true}
          icon={<Route />}
        />

        <StatCard
          title="Airports Covered"
          value="156"
          change="+3"
          positive={true}
          icon={<Plane />}
        />

        <StatCard
          title="Active Alerts"
          value="18"
          change="-12.5%"
          positive={false}
          icon={<Bell />}
        />

      </div>

      <div className="analytics-grid">

        {/* CHART */}

        <div className="analytics-card large">

          <div className="card-header">

            <div>
              <span>INDEX MOVEMENT</span>
              <h3>Airfare Trend — 2026</h3>
            </div>

            <select>
              <option>Last 12 Months</option>
              <option>Last 6 Months</option>
              <option>Last 3 Months</option>
            </select>

          </div>

          <div className="chart-area">

            <div className="chart-y-axis">
              <span>160</span>
              <span>150</span>
              <span>140</span>
              <span>130</span>
              <span>120</span>
            </div>

            <div className="line-chart">

              <div className="grid-line g1"></div>
              <div className="grid-line g2"></div>
              <div className="grid-line g3"></div>
              <div className="grid-line g4"></div>

              <svg
                viewBox="0 0 800 260"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="areaGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#38bdf8"
                      stopOpacity="0.25"
                    />

                    <stop
                      offset="100%"
                      stopColor="#38bdf8"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <path
                  className="chart-area-fill"
                  d="M0 205
                  C60 190 80 175 130 185
                  C180 195 200 150 250 160
                  C300 170 320 115 370 130
                  C420 145 445 105 490 115
                  C540 125 570 75 615 92
                  C665 110 690 55 735 72
                  C765 82 780 45 800 50
                  L800 260
                  L0 260 Z"
                />

                <path
                  className="chart-line"
                  d="M0 205
                  C60 190 80 175 130 185
                  C180 195 200 150 250 160
                  C300 170 320 115 370 130
                  C420 145 445 105 490 115
                  C540 125 570 75 615 92
                  C665 110 690 55 735 72
                  C765 82 780 45 800 50"
                />

              </svg>

              <div className="chart-x-axis">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>

            </div>

          </div>

        </div>

        {/* TOP ROUTES */}

        <div className="analytics-card">

          <div className="card-header">
            <div>
              <span>HIGH ACTIVITY</span>
              <h3>Top Routes</h3>
            </div>

            <ArrowUpRight size={18} />
          </div>

          <div className="route-list">

            <RouteRow
              route="DEL → BOM"
              value="₹8,420"
              percent="18.4%"
            />

            <RouteRow
              route="DEL → BLR"
              value="₹7,980"
              percent="16.2%"
            />

            <RouteRow
              route="BOM → BLR"
              value="₹6,740"
              percent="14.8%"
            />

            <RouteRow
              route="DEL → HYD"
              value="₹6,210"
              percent="12.4%"
            />

            <RouteRow
              route="BLR → MAA"
              value="₹5,840"
              percent="10.9%"
            />

          </div>

        </div>

      </div>

      {/* BOTTOM GRID */}

      <div className="bottom-grid">

        <div className="analytics-card">

          <div className="card-header">
            <div>
              <span>LIVE MONITORING</span>
              <h3>System Status</h3>
            </div>
          </div>

          <div className="system-status">

            <StatusRow
              name="Data Collection"
              status="Operational"
            />

            <StatusRow
              name="Price Processing"
              status="Operational"
            />

            <StatusRow
              name="Index Calculation"
              status="Operational"
            />

            <StatusRow
              name="API Services"
              status="Operational"
            />

          </div>

        </div>

        <div className="analytics-card">

          <div className="card-header">
            <div>
              <span>RECENT ACTIVITY</span>
              <h3>Platform Activity</h3>
            </div>
          </div>

          <div className="activity-list">

            <ActivityRow
              text="Airfare dataset updated"
              time="2 mins ago"
            />

            <ActivityRow
              text="Route data processed"
              time="8 mins ago"
            />

            <ActivityRow
              text="Index calculation completed"
              time="15 mins ago"
            />

            <ActivityRow
              text="New airport data received"
              time="32 mins ago"
            />

          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   AIRFARE INDEX
========================================================= */

function AirfareIndex() {
  const monthlyData = [
    ["January 2026", "128.42", "+2.4%", "Updated"],
    ["February 2026", "131.18", "+2.1%", "Updated"],
    ["March 2026", "134.76", "+2.7%", "Updated"],
    ["April 2026", "137.32", "+1.9%", "Updated"],
    ["May 2026", "140.15", "+2.1%", "Updated"],
    ["June 2026", "142.68", "+1.8%", "Updated"],
  ];

  const handleExport = () => {
    downloadCSV(
      "airindex-monthly-index.csv",
      ["Month", "Index Value", "Change", "Status"],
      monthlyData
    );
  };

  return (
    <div className="page-animation">

      <PageTitle
        kicker="INDEX INTELLIGENCE"
        title="Airfare Index"
        description="Monitor national and regional airfare price movements."
      />

      <div className="stats-grid">

        <StatCard
          title="Current Index"
          value="142.68"
          change="+4.82%"
          positive={true}
          icon={<TrendingUp />}
        />

        <StatCard
          title="Monthly Change"
          value="+3.21%"
          change="vs last month"
          positive={true}
          icon={<Activity />}
        />

        <StatCard
          title="Peak Index"
          value="151.92"
          change="Aug 2026"
          positive={false}
          icon={<ArrowUpRight />}
        />

        <StatCard
          title="Base Year"
          value="2024"
          change="100 = Base"
          positive={true}
          icon={<Database />}
        />

      </div>

      <div className="analytics-card full-width">

        <div className="card-header">

          <div>
            <span>MONTHLY INDEX</span>
            <h3>National Airfare Index Movement</h3>
          </div>

          <button className="download-btn" onClick={handleExport}>
            <Download size={15} />
            Export
          </button>

        </div>

        <div className="index-table">

          <div className="table-row table-heading">
            <span>Month</span>
            <span>Index Value</span>
            <span>Change</span>
            <span>Status</span>
          </div>

          {monthlyData.map((row) => (
            <div className="table-row" key={row[0]}>
              <span>{row[0]}</span>
              <strong>{row[1]}</strong>
              <span className="positive-text">
                {row[2]}
              </span>
              <span className="status-pill">
                {row[3]}
              </span>
            </div>
          ))}

        </div>

      </div>

      <IndexChangeExplainer />

    </div>
  );
}


function IndexChangeExplainer() {
  const factors = [
    {
      factor: "Jet Fuel Price Increase",
      pct: 2.1,
      note: "ATF prices rose alongside global crude oil movement this month.",
    },
    {
      factor: "Festive Season Demand",
      pct: 1.6,
      note: "Booking volumes rose ahead of the upcoming festival travel period.",
    },
    {
      factor: "Reduced Capacity (Fleet Grounding)",
      pct: 0.9,
      note: "A temporary reduction in available aircraft tightened seat supply.",
    },
    {
      factor: "Currency / Input Cost Adjustment",
      pct: 0.4,
      note: "Marginal impact from forex and maintenance cost pass-through.",
    },
    {
      factor: "Competitive Fare Discounting",
      pct: -0.18,
      note: "Partially offset by promotional fares on select high-demand routes.",
    },
  ];

  const maxAbs = Math.max(...factors.map((f) => Math.abs(f.pct)));
  const netChange = factors
    .reduce((sum, f) => sum + f.pct, 0)
    .toFixed(2);

  return (
    <div className="analytics-card full-width index-change-card">

      <div className="card-header">
        <div>
          <span>ATTRIBUTION</span>
          <h3>
            <HelpCircle
              size={16}
              style={{ verticalAlign: "-3px", marginRight: 6 }}
            />
            Why did the Index Change?
          </h3>
        </div>

        <span className="status-pill">Net: +{netChange}%</span>
      </div>

      <p style={{ color: "#8193a8", fontSize: "9.5px", margin: "0 0 14px" }}>
        Breakdown of the estimated contribution each factor made to this
        month's national airfare index movement.
      </p>

      {factors.map((f) => (
        <div className="index-change-factor" key={f.factor}>

          <div className="index-change-factor-info">
            <strong>{f.factor}</strong>
            <span>{f.note}</span>
          </div>

          <div className="index-change-bar-track">
            <div
              className={`index-change-bar-fill ${
                f.pct < 0 ? "negative" : ""
              }`}
              style={{
                width: `${(Math.abs(f.pct) / maxAbs) * 100}%`,
              }}
            ></div>
          </div>

          <span className="index-change-pct">
            {f.pct >= 0 ? "+" : ""}
            {f.pct}%
          </span>

        </div>
      ))}

    </div>
  );
}


/* =========================================================
   ROUTE ANALYTICS
========================================================= */

function heatColor(value, min, max) {
  const ratio = max === min ? 0.5 : (value - min) / (max - min);
  const hue = 215 - ratio * 215; // blue (low fare) → red (high fare)
  return `hsl(${hue}, 72%, ${45 - ratio * 8}%)`;
}

function RouteAnalytics() {
  const routes = [
    ["Delhi → Mumbai", "₹8,420", "+18.4%", "High"],
    ["Delhi → Bengaluru", "₹7,980", "+16.2%", "High"],
    ["Mumbai → Bengaluru", "₹6,740", "+14.8%", "Medium"],
    ["Delhi → Hyderabad", "₹6,210", "+12.4%", "Medium"],
    ["Bengaluru → Chennai", "₹5,840", "+10.9%", "Low"],
    ["Mumbai → Delhi", "₹8,180", "+9.7%", "Low"],
  ];

  const airportCodes = ["DEL", "BOM", "BLR", "HYD", "MAA", "CCU"];

  const fareMatrix = {
    DEL: { BOM: 5420, BLR: 6120, HYD: 4890, MAA: 6340, CCU: 5210 },
    BOM: { DEL: 5390, BLR: 4860, HYD: 4520, MAA: 5680, CCU: 6890 },
    BLR: { DEL: 6080, BOM: 4900, HYD: 3980, MAA: 3210, CCU: 7120 },
    HYD: { DEL: 4850, BOM: 4560, BLR: 4020, MAA: 3540, CCU: 6450 },
    MAA: { DEL: 6290, BOM: 5710, BLR: 3250, HYD: 3580, CCU: 7340 },
    CCU: { DEL: 5180, BOM: 6820, BLR: 7080, HYD: 6410, MAA: 7290 },
  };

  const allValues = airportCodes.flatMap((from) =>
    airportCodes
      .filter((to) => to !== from)
      .map((to) => fareMatrix[from][to])
  );
  const minFare = Math.min(...allValues);
  const maxFare = Math.max(...allValues);

  return (
    <div className="page-animation">

      <PageTitle
        kicker="NETWORK INTELLIGENCE"
        title="Route Analytics"
        description="Analyse fare behaviour across major domestic routes."
      />

      <div className="analytics-card full-width heatmap-card">

        <div className="card-header">
          <div>
            <span>FARE INTENSITY MATRIX</span>
            <h3>Origin → Destination Airfare Heatmap</h3>
          </div>
        </div>

        <div
          className="heatmap-grid"
          style={{
            gridTemplateColumns: `70px repeat(${airportCodes.length}, 1fr)`,
          }}
        >

          <div></div>
          {airportCodes.map((code) => (
            <div className="heatmap-col-label" key={`col-${code}`}>
              {code}
            </div>
          ))}

          {airportCodes.map((fromCode) => (
            <Fragment key={fromCode}>
              <div className="heatmap-row-label">
                {fromCode}
              </div>

              {airportCodes.map((toCode) => {
                if (fromCode === toCode) {
                  return (
                    <div
                      className="heatmap-cell empty"
                      key={`${fromCode}-${toCode}`}
                    >
                      —
                    </div>
                  );
                }

                const fare = fareMatrix[fromCode][toCode];

                return (
                  <div
                    className="heatmap-cell"
                    key={`${fromCode}-${toCode}`}
                    style={{
                      background: heatColor(fare, minFare, maxFare),
                    }}
                    title={`${fromCode} → ${toCode}: ₹${fare.toLocaleString(
                      "en-IN"
                    )}`}
                  >
                    ₹{(fare / 1000).toFixed(1)}k
                  </div>
                );
              })}
            </Fragment>
          ))}

        </div>

        <div className="heatmap-legend">
          <span>Lower fare</span>
          <span className="heatmap-legend-scale">
            <span style={{ background: heatColor(0, 0, 4) }}></span>
            <span style={{ background: heatColor(1, 0, 4) }}></span>
            <span style={{ background: heatColor(2, 0, 4) }}></span>
            <span style={{ background: heatColor(3, 0, 4) }}></span>
            <span style={{ background: heatColor(4, 0, 4) }}></span>
          </span>
          <span>Higher fare</span>
        </div>

      </div>

      <div className="analytics-card full-width">

        <div className="card-header">

          <div>
            <span>ROUTE PERFORMANCE</span>
            <h3>Major Domestic Routes</h3>
          </div>

        </div>

        <div className="index-table">

          <div className="table-row table-heading">
            <span>Route</span>
            <span>Avg Fare</span>
            <span>Fare Change</span>
            <span>Demand</span>
          </div>

          {routes.map((route) => (
            <div
              className="table-row"
              key={route[0]}
            >
              <strong>{route[0]}</strong>
              <span>{route[1]}</span>
              <span className="positive-text">
                {route[2]}
              </span>
              <span className="status-pill">
                {route[3]}
              </span>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   AIRPORT ANALYTICS
========================================================= */

function AirportAnalytics() {
  const airports = [
    {
      name: "Indira Gandhi International",
      code: "DEL",
      city: "Delhi",
      coverage: "98.4%",
      activity: "High",
      type: "International",
      connections: ["BOM", "BLR", "MAA", "Dubai (DXB)", "London (LHR)"],
    },
    {
      name: "Chhatrapati Shivaji Maharaj",
      code: "BOM",
      city: "Mumbai",
      coverage: "94.2%",
      activity: "High",
      type: "International",
      connections: ["DEL", "BLR", "GOI", "Singapore (SIN)", "Dubai (DXB)"],
    },
    {
      name: "Kempegowda International",
      code: "BLR",
      city: "Bengaluru",
      coverage: "91.7%",
      activity: "High",
      type: "International",
      connections: ["DEL", "BOM", "HYD", "Singapore (SIN)"],
    },
    {
      name: "Rajiv Gandhi International",
      code: "HYD",
      city: "Hyderabad",
      coverage: "84.6%",
      activity: "Medium",
      type: "International",
      connections: ["DEL", "BLR", "MAA", "Dubai (DXB)"],
    },
    {
      name: "Chennai International",
      code: "MAA",
      city: "Chennai",
      coverage: "81.3%",
      activity: "Medium",
      type: "International",
      connections: ["DEL", "BOM", "HYD", "Singapore (SIN)"],
    },
    {
      name: "Netaji Subhas Chandra Bose",
      code: "CCU",
      city: "Kolkata",
      coverage: "78.9%",
      activity: "Low",
      type: "International",
      connections: ["DEL", "BOM", "Bangkok (BKK)"],
    },
    {
      name: "Pune Airport",
      code: "PNQ",
      city: "Pune",
      coverage: "76.2%",
      activity: "Medium",
      type: "Domestic",
      connections: ["DEL", "BOM", "BLR"],
    },
    {
      name: "Goa International (Dabolim)",
      code: "GOI",
      city: "Goa",
      coverage: "74.8%",
      activity: "Medium",
      type: "Domestic",
      connections: ["DEL", "BOM", "BLR"],
    },
    {
      name: "Sardar Vallabhbhai Patel",
      code: "AMD",
      city: "Ahmedabad",
      coverage: "70.5%",
      activity: "Low",
      type: "Domestic",
      connections: ["DEL", "BOM"],
    },
    {
      name: "Jaipur International",
      code: "JAI",
      city: "Jaipur",
      coverage: "68.9%",
      activity: "Low",
      type: "Domestic",
      connections: ["DEL", "BOM"],
    },
  ];

  const [filterType, setFilterType] = useState("All");
  const [expandedCode, setExpandedCode] = useState(null);

  const visibleAirports =
    filterType === "All"
      ? airports
      : airports.filter((a) => a.type === filterType);

  const handleExport = () => {
    downloadCSV(
      `airports-${filterType.toLowerCase()}.csv`,
      ["Airport", "Code", "City", "Type", "Coverage", "Activity"],
      visibleAirports.map((a) => [
        a.name,
        a.code,
        a.city,
        a.type,
        a.coverage,
        a.activity,
      ])
    );
  };

  return (
    <div className="page-animation">

      <PageTitle
        kicker="AIRPORT INTELLIGENCE"
        title="Airport Analytics"
        description="Monitor airport coverage, activity and airfare performance."
      />

      <div className="stats-grid">

        <StatCard
          title="Covered Airports"
          value="156"
          change="+3 this month"
          positive={true}
          icon={<Plane />}
          onClick={() => setFilterType("All")}
          active={filterType === "All"}
        />

        <StatCard
          title="International"
          value="34"
          change="Airports"
          positive={true}
          icon={<MapPin />}
          onClick={() => setFilterType("International")}
          active={filterType === "International"}
        />

        <StatCard
          title="Domestic"
          value="122"
          change="Airports"
          positive={true}
          icon={<Route />}
          onClick={() => setFilterType("Domestic")}
          active={filterType === "Domestic"}
        />

        <StatCard
          title="Data Coverage"
          value="94.8%"
          change="+2.3%"
          positive={true}
          icon={<Database />}
        />

      </div>

      <div className="analytics-card full-width">

        <div className="card-header">

          <div>
            <span>AIRPORT PERFORMANCE</span>
            <h3>
              Airport Network
              {filterType !== "All" && (
                <span className="filter-chip">
                  {filterType}
                  <button onClick={() => setFilterType("All")}>
                    <X size={11} />
                  </button>
                </span>
              )}
            </h3>
          </div>

          <button className="download-btn" onClick={handleExport}>
            <Download size={15} />
            Export
          </button>

        </div>

        <div className="index-table airport-table">

          <div className="table-row table-heading">
            <span>Airport</span>
            <span>Code</span>
            <span>Coverage</span>
            <span>Activity</span>
          </div>

          {visibleAirports.map((airport) => {
            const isOpen = expandedCode === airport.code;
            return (
              <div key={airport.code}>
                <div
                  className="table-row airport-row"
                  onClick={() =>
                    setExpandedCode(isOpen ? null : airport.code)
                  }
                >
                  <strong>
                    {airport.name}
                    <span className="airport-city"> · {airport.city}</span>
                  </strong>
                  <span>{airport.code}</span>
                  <span className="positive-text">
                    {airport.coverage}
                  </span>
                  <span className="status-pill">
                    {airport.activity}
                  </span>
                </div>

                {isOpen && (
                  <div className="airport-detail-panel">
                    <strong>Top Connections from {airport.code}</strong>
                    <div className="airport-connections">
                      {airport.connections.map((dest) => (
                        <span
                          className="airport-connection-chip"
                          key={dest}
                        >
                          {airport.code}
                          <ArrowUpRight size={11} />
                          {dest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {visibleAirports.length === 0 && (
            <div className="table-row-empty">
              No airports found for this filter.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   ALERTS
========================================================= */

function Alerts() {
  const alerts = [
    {
      title: "Unusual fare increase",
      route: "Delhi → Mumbai",
      level: "Critical",
      time: "8 mins ago",
    },
    {
      title: "Price volatility detected",
      route: "Mumbai → Bengaluru",
      level: "Warning",
      time: "24 mins ago",
    },
    {
      title: "Data source delay",
      route: "Airport dataset",
      level: "Warning",
      time: "42 mins ago",
    },
    {
      title: "New route detected",
      route: "Delhi → Goa",
      level: "Info",
      time: "1 hour ago",
    },
  ];

  return (
    <div className="page-animation">

      <PageTitle
        kicker="MONITORING CENTER"
        title="Alerts"
        description="Review important airfare and system alerts."
      />

      <div className="alert-summary">

        <div className="alert-summary-card critical">
          <strong>01</strong>
          <span>Critical Alerts</span>
        </div>

        <div className="alert-summary-card warning">
          <strong>02</strong>
          <span>Warnings</span>
        </div>

        <div className="alert-summary-card info">
          <strong>01</strong>
          <span>Information</span>
        </div>

      </div>

      <div className="alerts-list">

        {alerts.map((alert) => (
          <div
            className={`alert-item ${alert.level.toLowerCase()}`}
            key={alert.title}
          >

            <div className="alert-icon">
              <Bell size={19} />
            </div>

            <div className="alert-details">

              <strong>{alert.title}</strong>

              <span>{alert.route}</span>

            </div>

            <div className="alert-meta">

              <span className="alert-level">
                {alert.level}
              </span>

              <small>{alert.time}</small>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}


/* =========================================================
   REPORTS
========================================================= */

function Reports() {
  const reportData = {
    "Monthly Airfare Index Report": {
      period: "August 2026",
      type: "PDF",
      headers: ["Month", "Index Value", "Change"],
      rows: [
        ["January 2026", "128.42", "+2.4%"],
        ["February 2026", "131.18", "+2.1%"],
        ["March 2026", "134.76", "+2.7%"],
        ["April 2026", "137.32", "+1.9%"],
        ["May 2026", "140.15", "+2.1%"],
        ["June 2026", "142.68", "+1.8%"],
      ],
    },
    "National Route Analytics": {
      period: "Q2 2026",
      type: "PDF",
      headers: ["Route", "Avg Fare", "Fare Change", "Demand"],
      rows: [
        ["Delhi → Mumbai", "₹8,420", "+18.4%", "High"],
        ["Delhi → Bengaluru", "₹7,980", "+16.2%", "High"],
        ["Mumbai → Bengaluru", "₹6,740", "+14.8%", "Medium"],
        ["Delhi → Hyderabad", "₹6,210", "+12.4%", "Medium"],
        ["Bengaluru → Chennai", "₹5,840", "+10.9%", "Low"],
        ["Mumbai → Delhi", "₹8,180", "+9.7%", "Low"],
      ],
    },
    "Airport Coverage Report": {
      period: "August 2026",
      type: "XLSX",
      headers: ["Airport", "Code", "Coverage", "Activity"],
      rows: [
        ["Indira Gandhi International", "DEL", "98.4%", "High"],
        ["Chhatrapati Shivaji Maharaj", "BOM", "94.2%", "High"],
        ["Kempegowda International", "BLR", "91.7%", "High"],
        ["Rajiv Gandhi International", "HYD", "84.6%", "Medium"],
        ["Chennai International", "MAA", "81.3%", "Medium"],
        ["Netaji Subhas Chandra Bose", "CCU", "78.9%", "Low"],
      ],
    },
    "Fare Volatility Analysis": {
      period: "July 2026",
      type: "PDF",
      headers: ["Route", "Volatility Index", "Trend"],
      rows: [
        ["Delhi → Mumbai", "High", "Rising"],
        ["Mumbai → Bengaluru", "Medium", "Stable"],
        ["Delhi → Goa", "High", "Rising"],
        ["Bengaluru → Chennai", "Low", "Stable"],
      ],
    },
  };

  const reports = Object.keys(reportData).map((name) => [
    name,
    reportData[name].period,
    reportData[name].type,
  ]);

  const handleDownloadReport = (name) => {
    const r = reportData[name];
    if (r.type === "PDF") {
      openPrintableReport(name, `Period: ${r.period}`, r.headers, r.rows);
    } else {
      downloadCSV(
        `${name.toLowerCase().replace(/\s+/g, "-")}.csv`,
        r.headers,
        r.rows
      );
    }
  };

  const handleGenerateNewReport = () => {
    const now = new Date();
    const summaryRows = Object.keys(reportData).map((name) => [
      name,
      reportData[name].period,
      reportData[name].type,
      `${reportData[name].rows.length} records`,
    ]);
    openPrintableReport(
      "AirIndex India — Platform Summary Report",
      `Generated on ${now.toLocaleDateString()}`,
      ["Report", "Period", "Format", "Records"],
      summaryRows
    );
  };

  const handleExportDataset = () => {
    downloadCSV(
      "airindex-reports-dataset.csv",
      ["Report", "Period", "Format"],
      reports
    );
  };

  return (
    <div className="page-animation">

      <PageTitle
        kicker="DATA REPORTING"
        title="Reports"
        description="Generate and access official airfare analytics reports."
      />

      <div className="report-actions">

        <button className="primary-action" onClick={handleGenerateNewReport}>
          <FileText size={17} />
          Generate New Report
        </button>

        <button className="secondary-action" onClick={handleExportDataset}>
          <Download size={17} />
          Export Dataset
        </button>

      </div>

      <div className="analytics-card full-width">

        <div className="card-header">

          <div>
            <span>DOCUMENT CENTER</span>
            <h3>Recent Reports</h3>
          </div>

        </div>

        <div className="reports-list">

          {reports.map((report) => (
            <div
              className="report-item"
              key={report[0]}
            >

              <div className="report-icon">
                <FileText size={20} />
              </div>

              <div className="report-info">
                <strong>{report[0]}</strong>
                <span>{report[1]}</span>
              </div>

              <span className="file-type">
                {report[2]}
              </span>

              <button
                className="download-small"
                onClick={() => handleDownloadReport(report[0])}
                title={
                  report[2] === "PDF"
                    ? "Open printable report (Save as PDF)"
                    : "Download as CSV"
                }
              >
                <Download size={16} />
              </button>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   DATA QUALITY & VALIDATION
========================================================= */

function DataQuality() {
  const checks = [
    {
      name: "Duplicate Route Detection",
      detail: "No duplicate origin-destination records found in this cycle.",
      status: "pass",
    },
    {
      name: "Fare Outlier Detection",
      detail: "2 fare records flagged more than 3σ from the route mean.",
      status: "warn",
    },
    {
      name: "Airport Code Validation",
      detail: "All IATA codes matched against the reference airport table.",
      status: "pass",
    },
    {
      name: "Timestamp Consistency",
      detail: "All records fall within expected collection windows.",
      status: "pass",
    },
    {
      name: "Currency Normalization",
      detail: "All fares confirmed in INR, no unit mismatches detected.",
      status: "pass",
    },
    {
      name: "Missing / Null Field Check",
      detail: "0.4% of records had a missing non-critical field (meal info).",
      status: "warn",
    },
  ];

  const passCount = checks.filter((c) => c.status === "pass").length;

  return (
    <div className="page-animation">

      <PageTitle
        kicker="DATA GOVERNANCE"
        title="Data Quality & Validation"
        description="Monitor dataset completeness, integrity and validation checks."
      />

      <div className="stats-grid dq-summary-grid">

        <StatCard
          title="Data Completeness"
          value="98.6%"
          change="+0.3%"
          positive={true}
          icon={<Gauge />}
        />

        <StatCard
          title="Validation Checks Passed"
          value={`${passCount}/${checks.length}`}
          change="This cycle"
          positive={passCount === checks.length}
          icon={<CheckCircle2 />}
        />

        <StatCard
          title="Last Sync"
          value="12 mins ago"
          change="Automated"
          positive={true}
          icon={<Activity />}
        />

        <StatCard
          title="Anomalies Flagged"
          value={String(checks.filter((c) => c.status === "warn").length)}
          change="Needs review"
          positive={false}
          icon={<AlertTriangle />}
        />

      </div>

      <div className="analytics-card full-width">

        <div className="card-header">
          <div>
            <span>VALIDATION PIPELINE</span>
            <h3>Dataset Checks — Current Cycle</h3>
          </div>
        </div>

        <div className="dq-check-list">
          {checks.map((c) => (
            <div className={`dq-check-row ${c.status}`} key={c.name}>
              {c.status === "pass" ? (
                <CheckCircle2 size={17} />
              ) : (
                <AlertTriangle size={17} />
              )}

              <div className="dq-check-info">
                <strong>{c.name}</strong>
                <span>{c.detail}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage() {
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    autoRefresh: true,
    securityMonitoring: true,
  });

  const togglePref = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="page-animation">

      <PageTitle
        kicker="PLATFORM CONFIGURATION"
        title="Settings"
        description="Manage AirIndex India platform preferences."
      />

      <div className="settings-grid">

        <div className="analytics-card">

          <div className="card-header">
            <div>
              <span>ADMIN PROFILE</span>
              <h3>Account Settings</h3>
            </div>
          </div>

          <div className="setting-group">

            <label>Administrator Name</label>

            <input
              value="AirIndex Administrator"
              readOnly
            />

          </div>

          <div className="setting-group">

            <label>Platform Role</label>

            <input
              value="System Administrator"
              readOnly
            />

          </div>

          <div className="setting-group">

            <label>Access Level</label>

            <input
              value="Full Administrative Access"
              readOnly
            />

          </div>

        </div>

        <div className="analytics-card">

          <div className="card-header">
            <div>
              <span>SYSTEM</span>
              <h3>Platform Preferences</h3>
            </div>
          </div>

          <div className="setting-switch">

            <div>
              <strong>Email Notifications</strong>
              <span>Receive important platform alerts</span>
            </div>

            <div
              className={`fake-switch ${prefs.emailNotifications ? "active" : ""}`}
              role="switch"
              aria-checked={prefs.emailNotifications}
              tabIndex={0}
              onClick={() => togglePref("emailNotifications")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  togglePref("emailNotifications");
                }
              }}
            ></div>

          </div>

          <div className="setting-switch">

            <div>
              <strong>Automatic Data Refresh</strong>
              <span>Refresh analytics automatically</span>
            </div>

            <div
              className={`fake-switch ${prefs.autoRefresh ? "active" : ""}`}
              role="switch"
              aria-checked={prefs.autoRefresh}
              tabIndex={0}
              onClick={() => togglePref("autoRefresh")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  togglePref("autoRefresh");
                }
              }}
            ></div>

          </div>

          <div className="setting-switch">

            <div>
              <strong>Security Monitoring</strong>
              <span>Monitor platform security events</span>
            </div>

            <div
              className={`fake-switch ${prefs.securityMonitoring ? "active" : ""}`}
              role="switch"
              aria-checked={prefs.securityMonitoring}
              tabIndex={0}
              onClick={() => togglePref("securityMonitoring")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  togglePref("securityMonitoring");
                }
              }}
            ></div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function PageTitle({ kicker, title, description }) {
  return (
    <div className="welcome-row">

      <div>
        <p className="section-kicker">{kicker}</p>

        <h2>{title}</h2>

        <p>{description}</p>
      </div>

    </div>
  );
}


function StatCard({
  title,
  value,
  change,
  positive,
  icon,
  onClick,
  active,
}) {
  return (
    <div
      className={`stat-card${onClick ? " stat-card-clickable" : ""}${
        active ? " stat-card-active" : ""
      }`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >

      <div className="stat-top">

        <div className="stat-icon">
          {icon}
        </div>

        <span
          className={
            positive
              ? "change positive"
              : "change negative"
          }
        >
          {positive ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight size={13} />
          )}

          {change}
        </span>

      </div>

      <span className="stat-title">
        {title}
      </span>

      <strong className="stat-value">
        {value}
      </strong>

    </div>
  );
}


function RouteRow({
  route,
  value,
  percent,
}) {
  return (
    <div className="route-row">

      <div>
        <strong>{route}</strong>
        <span>Domestic</span>
      </div>

      <div className="route-price">
        <strong>{value}</strong>
        <span>{percent}</span>
      </div>

    </div>
  );
}


function StatusRow({ name, status }) {
  return (
    <div className="status-row">

      <div>
        <span className="status-dot"></span>
        <strong>{name}</strong>
      </div>

      <span className="operational">
        {status}
      </span>

    </div>
  );
}


function ActivityRow({ text, time }) {
  return (
    <div className="activity-row">

      <div className="activity-dot"></div>

      <div>
        <strong>{text}</strong>
        <span>{time}</span>
      </div>

    </div>
  );
}

export default AdminDashboard;
