import { useState } from "react";
import API from "../services/api";
import "../assets/style/Register.css";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setMessage("You must agree to the terms and conditions.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("register/", {
        role,
        username,
        email,
        password,
        confirm_password: confirmPassword,
      });

      setMessage(response.data.message || "Registration successful!");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAgreeTerms(false);

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      if (error.response && error.response.data) {
        const data = error.response.data;
        setMessage(data.error || "Registration failed.");
      } else {
        setMessage("Server is not responding. Ensure Django is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-auth-card">
        <div className="register-auth-header">
          <h2>Create Account</h2>
          <p>Register to explore top opportunities</p>
        </div>

        <form onSubmit={register}>
          <div className="register-role-wrapper">
            <label className="register-role-label">I am a:</label>
            <div className="register-role-switcher" role="group">
              <input
                type="radio"
                className="btn-check"
                name="role"
                id="reg_student"
                value="student"
                checked={role === "student"}
                onChange={() => setRole("student")}
              />
              <label
                className={`role-option-btn ${role === "student" ? "active" : ""}`}
                htmlFor="reg_student"
              >
                <i className="bi bi-mortarboard me-1"></i> Student
              </label>

              <input
                type="radio"
                className="btn-check"
                name="role"
                id="reg_recruiter"
                value="recruiter"
                checked={role === "recruiter"}
                onChange={() => setRole("recruiter")}
              />
              <label
                className={`role-option-btn ${role === "recruiter" ? "active" : ""}`}
                htmlFor="reg_recruiter"
              >
                <i className="bi bi-briefcase me-1"></i> Recruiter
              </label>
            </div>
          </div>

          <div className="register-form-group">
            <label className="form-label">Username:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="register-form-group">
            <label className="form-label">Email Address:</label>
            <input
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="register-form-group">
            <label className="form-label">Password:</label>
            <input
              type="password"
              className="form-control"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="register-form-group">
            <label className="form-label">Confirm Password:</label>
            <input
              type="password"
              className="form-control"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="register-terms-group">
            <input
              type="checkbox"
              className="form-check-input"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            <label className="form-check-label" htmlFor="agreeTerms">
              I agree to the terms and conditions
            </label>
          </div>

          <button type="submit" className="register-submit-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {message && (
          <div
            className={`register-alert ${
              message.toLowerCase().includes("failed") ||
              message.toLowerCase().includes("not match") ||
              message.toLowerCase().includes("must agree")
                ? "register-alert-danger"
                : "register-alert-info"
            }`}
          >
            {message}
          </div>
        )}

        <div className="register-footer-prompt">
          Already have an account? <Link to="/">Login here</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;