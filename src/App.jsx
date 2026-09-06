import { useState } from "react";
import {
  Plane,
  ShieldCheck,
  BarChart3,
  Database,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  User,
  UserCog,
} from "lucide-react";

import "./App.css";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";
import { login, saveSession, clearSession } from "./api";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("user");
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your User ID / Email.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoggingIn(true);
    try {
      const { token, user } = await login(
        email.trim(),
        password,
        selectedRole
      );
      saveSession(token, user);
      setLoggedInUser(user);
      setShowDashboard(true);
    } catch (err) {
      setError(
        err.message ||
          "Login failed. Make sure the backend server is running."
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setShowDashboard(false);
    setLoggedInUser(null);
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleForgotPassword = () => {
    alert("Password reset functionality will be available soon.");
  };

  const handleGoogleLogin = () => {
    alert("Google login will be available soon.");
  };

  const handleMicrosoftLogin = () => {
    alert("Microsoft login will be available soon.");
  };

  /* =========================
     DASHBOARD ROUTING
  ========================== */

  if (showDashboard) {
    if (loggedInUser?.role === "admin") {
      return (
        <AdminDashboard
          email={loggedInUser?.email || email}
          onLogout={handleLogout}
        />
      );
    }

    return (
      <Dashboard
        role="user"
        email={loggedInUser?.email || email}
        onLogout={handleLogout}
      />
    );
  }

  /* =========================
     LOGIN PAGE
  ========================== */

  return (
    <div className="login-page">

      {/* LEFT SIDE */}
      <div className="login-left">

        <div className="brand-section">
          <div className="brand-logo">
            <Plane size={30} strokeWidth={2.2} />

            <span>
              AIRINDEX <span>INDIA</span>
            </span>
          </div>

          <p className="brand-subtitle">
            NATIONAL AIRFARE ANALYTICS PLATFORM
          </p>
        </div>

        <div className="hero-section">

          <p className="hero-small-title">
            INDIA'S AIRFARE INTELLIGENCE PLATFORM
          </p>

          <h1>
            Understanding India's
            <br />
            <span>Airfare Trends.</span>
          </h1>

          <p className="hero-description">
            A unified platform for monitoring, analysing and
            understanding airfare movements across India.
            Built to support transparent, data-driven aviation
            insights.
          </p>

        </div>

        {/* FLIGHT ROUTE */}
        <div className="india-flight">

          <div className="flight-country">

            <div className="country-dot"></div>

            <div>
              <small>ORIGIN</small>
              <strong>DELHI</strong>
            </div>

          </div>

          <div className="flight-route">

            <div className="route-line"></div>

            <Plane
              className="route-plane"
              size={34}
              strokeWidth={1.8}
            />

          </div>

          <div className="flight-country destination">

            <div>
              <small>DESTINATION</small>
              <strong>MUMBAI</strong>
            </div>

            <div className="country-dot"></div>

          </div>

        </div>

        {/* FEATURES */}
        <div className="login-features">

          <div className="feature-card">

            <div className="feature-icon">
              <BarChart3 size={19} />
            </div>

            <div>
              <h3>Airfare Analytics</h3>
              <p>Track price movements</p>
            </div>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              <Database size={19} />
            </div>

            <div>
              <h3>Data Driven</h3>
              <p>Reliable aviation data</p>
            </div>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              <ShieldCheck size={19} />
            </div>

            <div>
              <h3>Secure Platform</h3>
              <p>Government-grade security</p>
            </div>

          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">

        <div className="login-card">

          {/* HEADER */}
          <div className="login-header">

            <div className="login-icon">
              <LockKeyhole size={22} />
            </div>

            <div>
              <h2>Welcome Back</h2>
              <p>Sign in to AirIndex India</p>
            </div>

          </div>

          {/* SECURITY MESSAGE */}
          <div className="secure-message">

            <ShieldCheck size={19} />

            <div>
              <strong>Secure Government Platform</strong>

              <span>
                Your information is protected with
                enterprise-grade security.
              </span>
            </div>

          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <div className="form-group">

              <label htmlFor="email">
                User ID / Email
              </label>

              <div className="login-input">

                <Mail size={17} />

                <input
                  id="email"
                  type="text"
                  placeholder="Enter your User ID or email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoComplete="username"
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="login-input">

                <LockKeyhole size={17} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>

            {/* ERROR */}
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {/* OPTIONS */}
            <div className="login-options">

              <label className="remember-me">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                />

                <span>Remember me</span>

              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>

            </div>

            {/* ROLE */}
            <div className="login-role-section">

              <label>Login as</label>

              <div className="login-types">

                {/* USER */}
                <button
                  type="button"
                  className={`type-btn ${
                    selectedRole === "user"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedRole("user")
                  }
                >

                  <User size={20} />

                  <div>
                    <strong>User</strong>
                    <span>
                      View airfare insights
                    </span>
                  </div>

                </button>

                {/* ADMIN */}
                <button
                  type="button"
                  className={`type-btn admin ${
                    selectedRole === "admin"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedRole("admin")
                  }
                >

                  <UserCog size={20} />

                  <div>
                    <strong>Admin</strong>
                    <span>
                      Manage platform
                    </span>
                  </div>

                </button>

              </div>

            </div>

            {/* SIGN IN */}
            <button
              type="submit"
              className="login-button"
              disabled={loggingIn}
            >

              <span>{loggingIn ? "Signing In..." : "Sign In"}</span>

              <ArrowRight size={17} />

            </button>

          </form>

          {/* DEMO */}
          <p className="demo-note">
            <span>Demo Access:</span>{" "}
            Admin → admin@airindex.in / admin123 &nbsp;|&nbsp; User → user@airindex.in / user123
          </p>

          {/* DIVIDER */}
          <div className="login-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          {/* SOCIAL */}
          <div className="social-login">

            <button
              type="button"
              onClick={handleGoogleLogin}
            >
              <span className="google-icon">
                G
              </span>
              Google
            </button>

            <button
              type="button"
              onClick={handleMicrosoftLogin}
            >
              <span className="microsoft-icon">
                ▦
              </span>
              Microsoft
            </button>

          </div>

          {/* FOOTER */}
          <div className="security-footer">

            <CheckCircle2 size={14} />

            <span>
              Protected • Encrypted • Secure
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;
