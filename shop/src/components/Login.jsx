import { useState, useEffect } from "react";
import API from "../services/api";
import "../assets/style/Login.css";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedName = localStorage.getItem("remembered_username");
    if (savedName) {
      setUsername(savedName);
      setRememberMe(true);
    }
  }, []);

  const login = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await API.post("login/", {
        role,
        username,
        password,
      });

      if (response.data?.access) localStorage.setItem("access", response.data.access);
      if (response.data?.refresh) localStorage.setItem("refresh", response.data.refresh);
      
      const loggedInUsername = response.data?.username || username;
      const isStaff = Boolean(response.data?.is_staff || response.data?.staff);
      const isSuperuser = Boolean(response.data?.is_superuser || response.data?.superuser);
      const serverRole = response.data?.role;

      // Determine if user is admin or superuser based on backend response
      const isAdminOrSuperuser = isSuperuser || isStaff || serverRole === "admin";
      const finalRole = isAdminOrSuperuser ? "admin" : (serverRole || role);

      localStorage.setItem("username", loggedInUsername);
      localStorage.setItem("role", finalRole);
      localStorage.setItem("is_staff", isStaff ? "true" : "false");
      localStorage.setItem("is_superuser", isSuperuser ? "true" : "false");

      if (rememberMe) {
        localStorage.setItem("remembered_username", username);
      } else {
        localStorage.removeItem("remembered_username");
      }

      // Exact Routing Check
      if (isAdminOrSuperuser) {
        navigate("/admin");
      } else if (finalRole === "recruiter") {
        navigate("/recruiter");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.warn("API Error during login:", error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || "Invalid username or password.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-auth-card">
        <div className="login-auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account to continue</p>
        </div>

        {message && <div className="login-alert login-alert-danger">{message}</div>}

        <form onSubmit={login}>
          <div className="login-role-wrapper">
            <label className="login-role-label">I am a:</label>
            <div className="login-role-switcher" role="group">
              <input
                type="radio"
                className="btn-check"
                name="role"
                id="login_role_student"
                value="student"
                checked={role === "student"}
                onChange={() => setRole("student")}
              />
              <label className={`role-option-btn ${role === "student" ? "active" : ""}`} htmlFor="login_role_student">
                🎓 Student
              </label>

              <input
                type="radio"
                className="btn-check"
                name="role"
                id="login_role_recruiter"
                value="recruiter"
                checked={role === "recruiter"}
                onChange={() => setRole("recruiter")}
              />
              <label className={`role-option-btn ${role === "recruiter" ? "active" : ""}`} htmlFor="login_role_recruiter">
                💼 Recruiter
              </label>
            </div>
          </div>

          <div className="login-form-group">
            <label className="form-label">Username:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="login-form-group">
            <label className="form-label">Password:</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-form-group" style={{ display: "flex", alignItems: "center", gap: "8px", margin: "12px 0 20px 0" }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ cursor: "pointer", width: "16px", height: "16px" }}
            />
            <label htmlFor="rememberMe" style={{ cursor: "pointer", fontSize: "14px", color: "#475569", userSelect: "none" }}>
              Remember my username
            </label>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-footer-prompt">
          New user? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;