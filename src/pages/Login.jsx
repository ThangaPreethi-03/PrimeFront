import React, { useState } from "react";
import api, { checkEmailExists } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  /* -------------------------------
      EMAIL FORMAT CHECK
  -------------------------------- */
  const validateFormat = (val) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(val.trim());
  };

  /* -------------------------------
      ON BLUR → CHECK IF EMAIL EXISTS
  -------------------------------- */
  const handleEmailBlur = async () => {
    setEmailError("");

    if (!email.trim()) return;

    if (!validateFormat(email)) {
      setEmailError("Invalid email format");
      return;
    }

    try {
      const res = await checkEmailExists(email);

      // If backend says "doesn't exist"
      if (!res.data.exists) {
        setEmailError("No account found with this email");
      }
    } catch {
      console.warn("Email check endpoint not available yet.");
    }
  };

  /* -------------------------------
      LOGIN SUBMISSION
  -------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormat(email)) {
      setEmailError("Invalid email format");
      return;
    }

    try {
      const resp = await api.post("/auth/login", { email, password });

      if (!resp.data?.token) {
        alert("Login failed");
        return;
      }

      const token = resp.data.token;

      // Save token
      localStorage.setItem("token", token);

      // Apply token globally
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Update App.jsx context
      onLogin(token);

      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.msg || "Login error");
    }
  };

  return (
    <div className="container">
      <div className="auth-wrapper">
        <div className="auth-card-premium">
          <h2 className="auth-title">Welcome Back 👋</h2>
          <p className="auth-subtitle">Login to continue your shopping</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            
            {/* EMAIL */}
            <label>Email</label>
            <input
              value={email}
              onBlur={handleEmailBlur}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              className={`auth-input ${emailError ? "input-error" : ""}`}
              required
            />
            {emailError && (
              <p className="error-text">{emailError}</p>
            )}

            {/* PASSWORD */}
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
            />

            {/* BUTTON */}
            <button className="auth-btn" type="submit">
              Login
            </button>
          </form>

          {/* REGISTER LINK */}
          <p className="auth-footer-text">
            Don't have an account?{" "}
            <span
              className="auth-link"
              onClick={() => navigate("/register")}
            >
              Register Now
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
