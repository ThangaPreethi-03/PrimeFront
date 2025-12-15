import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [interests, setInterests] = useState([]);

  const navigate = useNavigate();

  const categories = [
    "Wearables",
    "Audio",
    "Footwear",
    "Accessories",
    "Cameras",
    "Computers"
  ];

  const toggleInterest = (cat) => {
    setInterests((prev) =>
      prev.includes(cat)
        ? prev.filter((i) => i !== cat)
        : [...prev, cat]
    );
  };

  // FRONTEND email format validation
  const validateEmailFormat = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailBlur = async () => {
    setEmailError("");

    if (!email.trim()) return;

    // 1) Basic format check like "abc@gmail.com"
    if (!validateEmailFormat(email)) {
      setEmailError("Invalid email format");
      return;
    }

    try {
      // 2) Call BE: check domain + exists
      const res = await api.post("/auth/check-email", { email });

      // 3) Domain does not exist
      if (!res.data.validDomain) {
        setEmailError("This email domain does not exist.");
        return;
      }

      // 4) Email already registered
      if (res.data.exists) {
        setEmailError("This email is already registered.");
        return;
      }

      setEmailError("");
    } catch (err) {
      console.warn("Email check failed:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmailFormat(email)) {
      setEmailError("Invalid email format");
      return;
    }

    if (emailError) return;

    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        interests
      });
localStorage.setItem("token", res.data.token);
onLogin(res.data.token);

      if (res.data?.token) {
        onRegister(res.data.token);
        navigate("/");
      } else {
        alert("Registration failed");
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Register error");
    }
  };

  return (
    <div className="container">
      <div className="auth-wrapper">
        <div className="auth-card-premium">
          <h2 className="auth-title">Create Account 🌟</h2>
          <p className="auth-subtitle">Join PrimeShop and start your journey</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>Name</label>
            <input
              className="auth-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Email</label>
            <input
              className={`auth-input ${emailError ? "input-error" : ""}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              onBlur={handleEmailBlur}
              required
            />
            {emailError && (
              <p className="error-text">{emailError}</p>
            )}

            <label>Password</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label style={{ marginTop: 15 }}>Choose Your Interests</label>
            <div className="interest-container">
              {categories.map((cat) => (
                <label key={cat} className="interest-item">
                  <input
                    type="checkbox"
                    checked={interests.includes(cat)}
                    onChange={() => toggleInterest(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>

            <button className="auth-btn">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
}
