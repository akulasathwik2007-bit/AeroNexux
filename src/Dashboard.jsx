import { useState } from "react";
import {
  LayoutDashboard,
  Search,
  TrendingUp,
  Map,
  BarChart3,
  Bell,
  Info,
  Headphones,
  Plane,
  User,
  LogOut,
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  MapPin,
  IndianRupee,
  Activity,
  ShieldCheck,
  Sun,
  Moon,
  Briefcase,
  Utensils,
  RotateCcw,
  Tag,
} from "lucide-react";

import "./Dashboard.css";

/* =========================================================
   FARE ANALYSIS HELPERS
========================================================= */

function parseRupees(priceStr) {
  return Number(String(priceStr).replace(/[^0-9]/g, "")) || 0;
}

function formatRupees(value) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function computeFareBreakdown(priceStr) {
  const total = parseRupees(priceStr);
  const baseFare = Math.round(total * 0.76);
  const taxesAndFees = total - baseFare;
  return { total, baseFare, taxesAndFees };
}

// Statistical projection only — illustrates how the tracked
// fare has historically moved at these booking horizons.
// Not a live price feed and not a "buy now" recommendation.
const FARE_TREND_HORIZONS = [
  { label: "T+1", days: 1, deltaPct: 0.4 },
  { label: "T+7", days: 7, deltaPct: 2.1 },
  { label: "T+15", days: 15, deltaPct: 4.8 },
  { label: "T+30", days: 30, deltaPct: 7.9 },
  { label: "T+45", days: 45, deltaPct: 11.2 },
];

function computeFareTrend(baseline) {
  return FARE_TREND_HORIZONS.map((h) => ({
    ...h,
    projected: baseline * (1 + h.deltaPct / 100),
  }));
}

function Dashboard({ role = "User", email = "", onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState("dark");

  const [from, setFrom] = useState("Delhi");
  const [to, setTo] = useState("Mumbai");
  const [date, setDate] = useState("");

  const [searchDone, setSearchDone] = useState(false);
  const [expandedFlight, setExpandedFlight] = useState(null);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Search Flights",
      icon: Search,
    },
    {
      name: "Airfare Trends",
      icon: TrendingUp,
    },
    {
      name: "Popular Routes",
      icon: Map,
    },
    {
      name: "Price Index",
      icon: BarChart3,
    },
    {
      name: "Alerts",
      icon: Bell,
    },
    {
      name: "About AirIndex",
      icon: Info,
    },
    {
      name: "Help & Support",
      icon: Headphones,
    },
  ];

  const stats = [
    {
      title: "Average Airfare",
      value: "₹6,842",
      change: "+4.8%",
      positive: false,
      icon: IndianRupee,
    },
    {
      title: "Routes Tracked",
      value: "1,248",
      change: "+12.4%",
      positive: true,
      icon: Map,
    },
    {
      title: "Flights Analysed",
      value: "18,420",
      change: "+8.6%",
      positive: true,
      icon: Plane,
    },
    {
      title: "Price Accuracy",
      value: "96.8%",
      change: "+2.1%",
      positive: true,
      icon: Activity,
    },
  ];

  const routes = [
    {
      from: "Delhi",
      code1: "DEL",
      to: "Mumbai",
      code2: "BOM",
      price: "₹5,420",
      change: "+3.2%",
      positive: false,
    },
    {
      from: "Mumbai",
      code1: "BOM",
      to: "Bengaluru",
      code2: "BLR",
      price: "₹4,860",
      change: "-2.4%",
      positive: true,
    },
    {
      from: "Delhi",
      code1: "DEL",
      to: "Bengaluru",
      code2: "BLR",
      price: "₹6,120",
      change: "+5.8%",
      positive: false,
    },
    {
      from: "Hyderabad",
      code1: "HYD",
      to: "Delhi",
      code2: "DEL",
      price: "₹5,740",
      change: "-1.6%",
      positive: true,
    },
    {
      from: "Chennai",
      code1: "MAA",
      to: "Mumbai",
      code2: "BOM",
      price: "₹4,980",
      change: "+1.9%",
      positive: false,
    },
  ];

  const flights = [
    {
      airline: "IndiGo",
      flight: "6E 2045",
      departure: "06:30",
      arrival: "08:40",
      duration: "2h 10m",
      price: "₹5,420",
      fareClass: "Economy",
      baggage: "15 kg check-in + 7 kg cabin",
      meal: "Not included (buy on board)",
      refund: "Non-refundable · date change fee ₹3,000",
    },
    {
      airline: "Air India",
      flight: "AI 864",
      departure: "09:15",
      arrival: "11:25",
      duration: "2h 10m",
      price: "₹6,180",
      fareClass: "Premium Economy",
      baggage: "20 kg check-in + 8 kg cabin",
      meal: "Complimentary snack + beverage",
      refund: "Partially refundable · cancellation fee ₹3,500",
    },
    {
      airline: "Akasa Air",
      flight: "QP 1120",
      departure: "13:40",
      arrival: "15:50",
      duration: "2h 10m",
      price: "₹5,760",
      fareClass: "Economy",
      baggage: "15 kg check-in + 7 kg cabin",
      meal: "Not included (buy on board)",
      refund: "Non-refundable · date change fee ₹2,750",
    },
    {
      airline: "Vistara",
      flight: "UK 951",
      departure: "18:20",
      arrival: "20:30",
      duration: "2h 10m",
      price: "₹6,420",
      fareClass: "Business",
      baggage: "35 kg check-in + 10 kg cabin",
      meal: "Complimentary multi-course meal",
      refund: "Fully refundable · no cancellation fee",
    },
  ];

  const handleSearch = () => {
    setSearchDone(true);
  };

  const swapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const openPage = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const renderDashboard = () => {
    return (
      <>
        <section className="welcome-section">
          <div>
            <p className="small-label">AIRINDEX INDIA</p>

            <h1>
              Welcome back,{" "}
              <span>{role === "Admin" ? "Admin" : "User"}</span>
            </h1>

            <p className="welcome-text">
              Monitor India's airfare trends, routes and price movements
              from one intelligent platform.
            </p>
          </div>

          <div className="date-box">
            <Calendar size={18} />
            <span>{new Date().toLocaleDateString("en-IN")}</span>
          </div>
        </section>

        <section className="stats-grid">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div className="stat-card" key={item.title}>
                <div className="stat-top">
                  <div className="stat-icon">
                    <Icon size={21} />
                  </div>

                  <span
                    className={
                      item.positive
                        ? "change positive"
                        : "change negative"
                    }
                  >
                    {item.positive ? (
                      <ArrowUpRight size={15} />
                    ) : (
                      <ArrowDownRight size={15} />
                    )}
                    {item.change}
                  </span>
                </div>

                <p>{item.title}</p>
                <h2>{item.value}</h2>
              </div>
            );
          })}
        </section>

        <section className="dashboard-grid">
          <div className="panel chart-panel">
            <div className="panel-header">
              <div>
                <h2>Airfare Price Trend</h2>
                <p>Average domestic airfare - last 6 months</p>
              </div>

              <select className="period-select">
                <option>6 Months</option>
                <option>3 Months</option>
                <option>1 Year</option>
              </select>
            </div>

            <div className="chart">
              <div className="y-axis">
                <span>₹8K</span>
                <span>₹6K</span>
                <span>₹4K</span>
                <span>₹2K</span>
                <span>₹0</span>
              </div>

              <div className="chart-area">
                <div className="grid-line line1"></div>
                <div className="grid-line line2"></div>
                <div className="grid-line line3"></div>
                <div className="grid-line line4"></div>

                <svg
                  className="trend-svg"
                  viewBox="0 0 600 250"
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
                        stopOpacity="0.30"
                      />
                      <stop
                        offset="100%"
                        stopColor="#38bdf8"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    d="M0 175 C80 160 100 180 150 145 C200 110 230 145 280 115 C330 85 350 125 400 92 C450 65 480 90 520 60 C550 42 575 55 600 35 L600 250 L0 250 Z"
                    fill="url(#areaGradient)"
                  />

                  <path
                    d="M0 175 C80 160 100 180 150 145 C200 110 230 145 280 115 C330 85 350 125 400 92 C450 65 480 90 520 60 C550 42 575 55 600 35"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="4"
                  />
                </svg>

                <div className="x-axis">
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Popular Routes</h2>
                <p>Highest demand routes</p>
              </div>

              <button
                className="text-button"
                onClick={() => openPage("Popular Routes")}
              >
                View All
                <ArrowRight size={15} />
              </button>
            </div>

            <div className="route-list">
              {routes.slice(0, 4).map((route) => (
                <div className="route-item" key={`${route.code1}-${route.code2}`}>
                  <div className="route-codes">
                    <strong>{route.code1}</strong>
                    <span></span>
                    <strong>{route.code2}</strong>
                  </div>

                  <div className="route-name">
                    {route.from} → {route.to}
                  </div>

                  <div className="route-price">
                    <strong>{route.price}</strong>

                    <small
                      className={
                        route.positive ? "green-text" : "red-text"
                      }
                    >
                      {route.change}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel insight-panel">
            <div className="insight-icon">
              <TrendingUp size={24} />
            </div>

            <div>
              <p className="small-label">MARKET INSIGHT</p>
              <h3>Airfare prices increased by 4.8%</h3>
              <p>
                Domestic airfare prices show a moderate upward movement
                compared with the previous month.
              </p>
            </div>
          </div>

          <div className="panel status-panel">
            <div className="status-icon">
              <ShieldCheck size={23} />
            </div>

            <div>
              <p className="small-label">DATA STATUS</p>
              <h3>System Operational</h3>
              <p>Latest airfare data successfully processed.</p>
            </div>

            <span className="online-dot"></span>
          </div>
        </section>
      </>
    );
  };

  const renderSearchFlights = () => {
    return (
      <>
        <PageHeader
          title="Search Flights"
          subtitle="Find and compare airfare information across Indian routes."
        />

        <div className="search-card">
          <div className="search-fields">
            <div className="field">
              <label>FROM</label>

              <div className="input-wrapper">
                <MapPin size={18} />

                <input
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Departure city"
                />
              </div>
            </div>

            <button
              className="swap-button"
              onClick={swapLocations}
              title="Swap locations"
            >
              ↔
            </button>

            <div className="field">
              <label>TO</label>

              <div className="input-wrapper">
                <MapPin size={18} />

                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Arrival city"
                />
              </div>
            </div>

            <div className="field">
              <label>DATE</label>

              <div className="input-wrapper">
                <Calendar size={18} />

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <button className="search-button" onClick={handleSearch}>
              <Search size={18} />
              Search
            </button>
          </div>
        </div>

        {searchDone && (
          <div className="panel results-panel">
            <div className="panel-header">
              <div>
                <h2>
                  Available Flights
                </h2>

                <p>
                  {from} → {to}
                  {date ? ` • ${date}` : ""}
                </p>
              </div>

              <span className="result-count">
                {flights.length} Results
              </span>
            </div>

            <div className="flight-list">
              {flights.map((flight) => {
                const isOpen = expandedFlight === flight.flight;
                const { total, baseFare, taxesAndFees } =
                  computeFareBreakdown(flight.price);

                return (
                  <div key={flight.flight}>
                    <div className="flight-row">
                      <div className="airline-box">
                        <div className="airline-logo">
                          <Plane size={18} />
                        </div>

                        <div>
                          <strong>{flight.airline}</strong>
                          <small>{flight.flight}</small>
                        </div>
                      </div>

                      <div className="flight-time">
                        <strong>{flight.departure}</strong>
                        <span>{from}</span>
                      </div>

                      <div className="duration">
                        <span>{flight.duration}</span>
                        <div></div>
                        <small>Direct</small>
                      </div>

                      <div className="flight-time">
                        <strong>{flight.arrival}</strong>
                        <span>{to}</span>
                      </div>

                      <div className="flight-cost">
                        <strong>{flight.price}</strong>
                        <small>per person</small>
                      </div>

                      <button
                        className="view-button"
                        onClick={() =>
                          setExpandedFlight(isOpen ? null : flight.flight)
                        }
                      >
                        {isOpen ? "Hide" : "View"}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="fare-observation-panel">
                        <div className="fare-observation-title">
                          <Tag size={14} />
                          Fare Observations — {flight.fareClass}
                        </div>

                        <div className="fare-observation-grid">
                          <div className="fare-obs-item">
                            <span>Base Fare</span>
                            <strong>{formatRupees(baseFare)}</strong>
                          </div>

                          <div className="fare-obs-item">
                            <span>Taxes &amp; Fees</span>
                            <strong>{formatRupees(taxesAndFees)}</strong>
                          </div>

                          <div className="fare-obs-item">
                            <span>Total Observed Fare</span>
                            <strong>{formatRupees(total)}</strong>
                          </div>

                          <div className="fare-obs-item">
                            <span>Fare Class</span>
                            <strong>{flight.fareClass}</strong>
                          </div>
                        </div>

                        <div className="fare-observation-rules">
                          <div className="fare-rule-row">
                            <Briefcase size={15} />
                            <div>
                              <strong>Baggage Allowance</strong>
                              <span>{flight.baggage}</span>
                            </div>
                          </div>

                          <div className="fare-rule-row">
                            <Utensils size={15} />
                            <div>
                              <strong>Meal</strong>
                              <span>{flight.meal}</span>
                            </div>
                          </div>

                          <div className="fare-rule-row">
                            <RotateCcw size={15} />
                            <div>
                              <strong>Refund / Cancellation Rules</strong>
                              <span>{flight.refund}</span>
                            </div>
                          </div>
                        </div>

                        <p className="fare-observation-disclaimer">
                          This is a fare analytics observation, not a
                          booking. Figures illustrate the recorded fare
                          composition for this data point.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <FareTrendAnalysis
              from={from}
              to={to}
              baseline={parseRupees(flights[0]?.price)}
            />
          </div>
        )}
      </>
    );
  };

  const renderTrends = () => {
    return (
      <>
        <PageHeader
          title="Airfare Trends"
          subtitle="Analyse how airfare prices are changing across India."
        />

        <div className="trend-summary-grid">
          <div className="trend-card">
            <span>Current Index</span>
            <strong>142.6</strong>
            <small className="red-text">+4.8% this month</small>
          </div>

          <div className="trend-card">
            <span>Previous Month</span>
            <strong>136.1</strong>
            <small>August 2026</small>
          </div>

          <div className="trend-card">
            <span>Peak Index</span>
            <strong>151.4</strong>
            <small>July 2026</small>
          </div>

          <div className="trend-card">
            <span>Base Index</span>
            <strong>100.0</strong>
            <small>Base Year</small>
          </div>
        </div>

        <div className="panel large-chart">
          <div className="panel-header">
            <div>
              <h2>Monthly Airfare Movement</h2>
              <p>Airfare price index trend</p>
            </div>
          </div>

          <div className="big-bars">
            {[65, 72, 68, 78, 84, 76, 90, 95, 88, 100, 92, 97].map(
              (height, index) => (
                <div className="bar-column" key={index}>
                  <div
                    className="bar"
                    style={{ height: `${height}%` }}
                  ></div>

                  <span>
                    {[
                      "Oct",
                      "Nov",
                      "Dec",
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                    ][index]}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </>
    );
  };

  const renderPopularRoutes = () => {
    return (
      <>
        <PageHeader
          title="Popular Routes"
          subtitle="Explore India's most active domestic air routes."
        />

        <div className="route-cards">
          {routes.map((route, index) => (
            <div className="route-card" key={index}>
              <div className="route-card-top">
                <span className="rank">#{index + 1}</span>

                <Map size={20} />
              </div>

              <div className="route-big">
                <strong>{route.code1}</strong>
                <ArrowRight size={22} />
                <strong>{route.code2}</strong>
              </div>

              <p>
                {route.from} → {route.to}
              </p>

              <div className="route-card-bottom">
                <span>Average Fare</span>
                <strong>{route.price}</strong>
              </div>

              <div
                className={
                  route.positive
                    ? "route-change green-text"
                    : "route-change red-text"
                }
              >
                {route.change} this month
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderPriceIndex = () => {
    return (
      <>
        <PageHeader
          title="Price Index"
          subtitle="Monitor the Airfare Price Index across major Indian markets."
        />

        <div className="index-main-card">
          <div className="index-value">
            <span>Current Airfare Price Index</span>
            <strong>142.6</strong>
            <div className="index-change">
              <ArrowUpRight size={17} />
              4.8% from previous month
            </div>
          </div>

          <div className="index-meter">
            <div className="meter-track">
              <div className="meter-fill"></div>
            </div>

            <div className="meter-labels">
              <span>100</span>
              <span>120</span>
              <span>140</span>
              <span>160</span>
              <span>180</span>
            </div>
          </div>
        </div>

        <div className="index-table panel">
          <div className="panel-header">
            <div>
              <h2>City-wise Price Index</h2>
              <p>Latest available values</p>
            </div>
          </div>

          <div className="table">
            <div className="table-row table-heading">
              <span>City</span>
              <span>Index</span>
              <span>Monthly Change</span>
              <span>Status</span>
            </div>

            {[
              ["Delhi", "146.2", "+5.2%", "High"],
              ["Mumbai", "151.8", "+6.4%", "High"],
              ["Bengaluru", "138.5", "+2.8%", "Moderate"],
              ["Hyderabad", "136.4", "+2.1%", "Moderate"],
              ["Chennai", "133.9", "+1.7%", "Stable"],
            ].map((item) => (
              <div className="table-row" key={item[0]}>
                <span>{item[0]}</span>
                <strong>{item[1]}</strong>
                <span className="red-text">{item[2]}</span>
                <span className="status-pill">{item[3]}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  const renderAlerts = () => {
    const alerts = [
      {
        title: "Mumbai–Delhi fares rising",
        message:
          "Average fares increased by 6.4% compared with the previous month.",
        type: "warning",
      },
      {
        title: "Bengaluru routes stabilising",
        message:
          "Airfare prices have remained within the expected range.",
        type: "success",
      },
      {
        title: "New data available",
        message:
          "Latest domestic airfare observations have been processed.",
        type: "info",
      },
    ];

    return (
      <>
        <PageHeader
          title="Alerts"
          subtitle="Important airfare and system notifications."
        />

        <div className="alerts-list">
          {alerts.map((alertItem) => (
            <div
              className={`alert-card ${alertItem.type}`}
              key={alertItem.title}
            >
              <div className="alert-icon">
                <Bell size={21} />
              </div>

              <div>
                <h3>{alertItem.title}</h3>
                <p>{alertItem.message}</p>
                <small>Updated recently</small>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderAbout = () => {
    return (
      <>
        <PageHeader
          title="About AirIndex India"
          subtitle="India's airfare price intelligence platform."
        />

        <div className="about-grid">
          <div className="panel about-main">
            <div className="about-logo">
              <Plane size={28} />
              <span>
                AIR<span>INDEX</span>
              </span>
            </div>

            <h2>Understanding India's Airfare Trends</h2>

            <p>
              AirIndex India is designed to provide a centralised view of
              airfare prices, route activity and price movements across
              India's domestic aviation network.
            </p>

            <p>
              The platform helps users understand airfare patterns through
              interactive dashboards, route analysis, price indexes and
              trend visualisations.
            </p>

            <div className="about-features">
              <div>
                <TrendingUp size={20} />
                <span>Airfare Trends</span>
              </div>

              <div>
                <Map size={20} />
                <span>Route Intelligence</span>
              </div>

              <div>
                <BarChart3 size={20} />
                <span>Price Analytics</span>
              </div>
            </div>
          </div>

          <div className="panel mission-card">
            <div className="mission-icon">
              <ShieldCheck size={25} />
            </div>

            <h3>Our Mission</h3>

            <p>
              Make airfare data easier to understand through transparent,
              data-driven and user-friendly analytics.
            </p>

            <div className="mission-stat">
              <strong>1,248+</strong>
              <span>Routes monitored</span>
            </div>

            <div className="mission-stat">
              <strong>18K+</strong>
              <span>Flights analysed</span>
            </div>

            <div className="mission-stat">
              <strong>96.8%</strong>
              <span>Data accuracy</span>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderHelp = () => {
    return (
      <>
        <PageHeader
          title="Help & Support"
          subtitle="Get assistance with AirIndex India."
        />

        <div className="help-grid">
          <div className="help-card">
            <Search size={26} />
            <h3>How to search flights?</h3>
            <p>
              Open Search Flights, enter departure and arrival cities,
              select a date and click Search.
            </p>

            <button
              onClick={() => openPage("Search Flights")}
              className="help-button"
            >
              Try Search
            </button>
          </div>

          <div className="help-card">
            <BarChart3 size={26} />
            <h3>Understanding Price Index</h3>
            <p>
              The Price Index section helps you understand relative
              airfare movement across time and cities.
            </p>

            <button
              onClick={() => openPage("Price Index")}
              className="help-button"
            >
              View Index
            </button>
          </div>

          <div className="help-card">
            <Headphones size={26} />
            <h3>Need more help?</h3>
            <p>
              For assistance with the platform, contact the AirIndex
              support team.
            </p>

            <button
              className="help-button"
              onClick={() =>
                alert("Support: support@airindexindia.gov.in")
              }
            >
              Contact Support
            </button>
          </div>
        </div>
      </>
    );
  };

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return renderDashboard();

      case "Search Flights":
        return renderSearchFlights();

      case "Airfare Trends":
        return renderTrends();

      case "Popular Routes":
        return renderPopularRoutes();

      case "Price Index":
        return renderPriceIndex();

      case "Alerts":
        return renderAlerts();

      case "About AirIndex":
        return renderAbout();

      case "Help & Support":
        return renderHelp();

      default:
        return renderDashboard();
    }
  };

  return (
    <div className={`dashboard-app ${theme === "light" ? "light-theme" : ""}`}>
      <aside
        className={`dashboard-sidebar ${
          sidebarOpen ? "open" : "closed"
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Plane size={23} />
          </div>

          {sidebarOpen && (
            <div className="brand-text">
              <strong>
                AIR<span>INDEX</span>
              </strong>
              <small>INDIA</small>
            </div>
          )}
        </div>

        <div className="sidebar-menu">
          <p className="menu-title">
            {sidebarOpen ? "MAIN MENU" : "MENU"}
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`menu-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => openPage(item.name)}
                title={!sidebarOpen ? item.name : ""}
              >
                <Icon size={19} />
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            );
          })}
        </div>

        <div className="sidebar-bottom">
          {sidebarOpen && (
            <div className="user-profile">
              <div className="profile-avatar">
                <User size={18} />
              </div>

              <div className="profile-info">
                <strong>
                  {role === "Admin" ? "Admin User" : "Public User"}
                </strong>

                <span>{email || "user@airindex.in"}</span>
              </div>
            </div>
          )}

          <button
            className="logout-button"
            onClick={onLogout}
            title={!sidebarOpen ? "Logout" : ""}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div>
              <p className="breadcrumb">
                AirIndex India / {activePage}
              </p>
              <h3>{activePage}</h3>
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

            <div className="system-status">
              <span></span>
              System Online
            </div>

            <div className="top-profile">
              <div className="profile-avatar small">
                <User size={17} />
              </div>

              <span>{role === "Admin" ? "Admin" : "User"}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {renderPage()}
        </div>

        <footer className="dashboard-footer">
          <span>© 2026 AirIndex India</span>
          <span>Airfare Price Intelligence Platform</span>
        </footer>
      </main>
    </div>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <section className="page-header">
      <div>
        <p className="small-label">AIRINDEX INDIA</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </section>
  );
}


function FareTrendAnalysis({ from, to, baseline }) {
  if (!baseline) return null;

  const trend = computeFareTrend(baseline);

  return (
    <div className="fare-trend-card">
      <div className="fare-trend-header">
        <div>
          <span className="small-label">STATISTICAL PROJECTION</span>
          <h3>Fare Trend Analysis · {from} → {to}</h3>
        </div>
      </div>

      <p className="fare-trend-description">
        Historical booking-curve pattern for this route, showing how the
        tracked fare has typically moved at each horizon from today.
      </p>

      <div className="fare-trend-grid">
        {trend.map((point) => (
          <div className="fare-trend-point" key={point.label}>
            <span className="fare-trend-label">{point.label}</span>
            <strong className="fare-trend-value">
              {formatRupees(point.projected)}
            </strong>
            <span
              className={`fare-trend-delta ${
                point.deltaPct >= 0 ? "red-text" : "green-text"
              }`}
            >
              {point.deltaPct >= 0 ? "+" : ""}
              {point.deltaPct}%
            </span>
          </div>
        ))}
      </div>

      <p className="fare-trend-disclaimer">
        Analytical estimate only — not a live price feed or a purchase
        recommendation.
      </p>
    </div>
  );
}

export default Dashboard;