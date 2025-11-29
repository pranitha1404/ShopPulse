import React, { useState } from "react";

const cardStyle = {
  background: "#020617",
  borderRadius: "16px",
  padding: "24px",
  width: "360px",
  boxShadow: "0 20px 40px rgba(15,23,42,0.8)",
  color: "white",
  border: "1px solid #1f2937",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #4b5563",
  background: "#020617",
  color: "white",
};

const buttonStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "none",
  background: "#38bdf8",
  color: "#020617",
  fontWeight: 600,
  cursor: "pointer",
};

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Hard-coded admin login for demo / assignment
    if (email === "admin@example.com" && password === "password123") {
      const fakeToken = "demo-token";
      const tenantId = 1;
      onLoginSuccess(fakeToken, tenantId);
    } else {
      setError("Login failed. Check credentials.");
    }

    setLoading(false);
  };

  return (
    <div style={cardStyle}>
      <h2 style={{ marginBottom: "4px" }}>ShopPulse Dashboard</h2>
      <p style={{ marginBottom: "16px", color: "#9ca3af", fontSize: "0.9rem" }}>
        Sign in with your admin credentials
      </p>
      <form onSubmit={handleSubmit}>
        <label style={{ fontSize: "0.85rem" }}>Email</label>
        <input
          style={inputStyle}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label style={{ fontSize: "0.85rem" }}>Password</label>
        <input
          style={inputStyle}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div
            style={{
              color: "#f97373",
              fontSize: "0.8rem",
              marginBottom: "8px",
            }}
          >
            {error}
          </div>
        )}
        <button style={buttonStyle} type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p style={{ marginTop: "16px", fontSize: "0.75rem", color: "#6b7280" }}>
        Default: admin@example.com / password123
      </p>
    </div>
  );
};

export default LoginForm;
