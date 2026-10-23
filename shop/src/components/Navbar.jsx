import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import "../assets/style/Navbar.css";

function Navbar() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    updateUserData();
    fetchNotifications();
  }, [location]);

  const updateUserData = () => {
    const storedUsername = localStorage.getItem("username") || "User";
    const storedRole = localStorage.getItem("role") || "student";
    const isSuperuser = localStorage.getItem("is_superuser") === "true";
    const isStaff = localStorage.getItem("is_staff") === "true";
    
    // Role is admin if staff, superuser, or stored role is admin
    const resolvedRole = (isSuperuser || isStaff || storedRole === "admin") ? "admin" : storedRole;
    
    setUsername(storedUsername);
    setRole(resolvedRole);
  };

  const fetchNotifications = async () => {
    try {
      const response = await API.get("student/notifications/");
      if (response.data && response.data.notifications) {
        setNotifications(response.data.notifications);
      }
    } catch (err) {
      console.warn("Could not fetch notifications from backend:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("is_staff");
    localStorage.removeItem("is_superuser");
    navigate("/");
  };

  const dashboardPath = role === "admin" ? "/admin" : role === "recruiter" ? "/recruiter" : "/home";

  return (
    <nav className="naukri-navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="navbar-left">
          <Link to={dashboardPath} className="navbar-logo">
            <span className="logo-icon">JobNest</span>
          </Link>

          {/* Navigation Links */}
          <ul className="nav-menu">
            {(role === "student" || (role !== "recruiter" && role !== "admin")) && (
              <li className="nav-item">
                <Link to="/home" className={`nav-link ${location.pathname === "/home" ? "active" : ""}`}>
                  Jobs
                </Link>
              </li>
            )}
            {role === "recruiter" && (
              <li className="nav-item">
                <Link to="/recruiter" className={`nav-link ${location.pathname === "/recruiter" ? "active" : ""}`}>
                  Recruiter Dashboard
                </Link>
              </li>
            )}
            {role === "admin" && (
              <li className="nav-item">
                <Link to="/admin" className={`nav-link ${location.pathname === "/admin" ? "active" : ""}`}>
                  ⚡ Admin Panel
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Right User Actions */}
        <div className="navbar-right" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* Notification Icon for Students & Admins */}
          {(role === "student" || role === "admin") && (
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "relative",
                  fontSize: "18px",
                }}
                title="Notifications"
              >
                🔔
                {notifications.length > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-2px",
                      right: "-2px",
                      backgroundColor: "#ef4444",
                      color: "#ffffff",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Dropdown Popup */}
              {showNotifications && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "50px",
                    width: "320px",
                    background: "#ffffff",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    zIndex: 1000,
                    padding: "15px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "10px" }}>
                    <strong style={{ color: "#0f172a", fontSize: "15px" }}>Notifications</strong>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>{notifications.length} alerts</span>
                  </div>

                  {notifications.length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: "13px", margin: "15px 0", textAlign: "center" }}>
                      No notifications yet. You will be notified when a recruiter shortlists your application.
                    </p>
                  ) : (
                    <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: "10px 12px",
                            background: n.status === "shortlisted" ? "#f0fdf4" : "#fef2f2",
                            borderRadius: "8px",
                            borderLeft: `4px solid ${n.status === "shortlisted" ? "#22c55e" : "#ef4444"}`,
                          }}
                        >
                          <p style={{ fontSize: "13px", color: "#1e293b", margin: "0 0 4px 0", fontWeight: "500", lineHeight: "1.4" }}>
                            {n.message}
                          </p>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>{n.applied_at || n.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="user-profile-badge">
            <div className="avatar-circle">
              <i className="bi bi-person-fill"></i>
            </div>
            <div className="user-info-text">
              <span className="welcome-greeting">Welcome, <strong>{username}</strong></span>
              <span className="user-role-tag">
                {role === "admin" ? "👑 Superuser / Admin" : role === "recruiter" ? "💼 Recruiter Account" : "🎓 Student Candidate"}
              </span>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-btn" title="Logout from account">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;