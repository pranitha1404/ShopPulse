import React, { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm.jsx";
import Dashboard from "./components/Dashboard.jsx";

const App = () => {
  const [token, setToken] = useState(null);
  const [tenantId, setTenantId] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("xeno_token");
    const storedTenantId = localStorage.getItem("xeno_tenantId");
    if (storedToken && storedTenantId) {
      setToken(storedToken);
      setTenantId(storedTenantId);
    }
  }, []);

  const handleLoginSuccess = (token, tenantId) => {
    localStorage.setItem("xeno_token", token);
    localStorage.setItem("xeno_tenantId", tenantId);
    setToken(token);
    setTenantId(tenantId);
  };

  const handleLogout = () => {
    localStorage.removeItem("xeno_token");
    localStorage.removeItem("xeno_tenantId");
    setToken(null);
    setTenantId(null);
  };

  if (!token || !tenantId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#020617",
        }}
      >
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return <Dashboard onLogout={handleLogout} />;
};

export default App;
