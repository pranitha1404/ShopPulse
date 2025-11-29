import React, { useEffect, useState } from "react";
import api from "../api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = ({ onLogout }) => {
  const [summary, setSummary] = useState(null);
  const [ordersByDate, setOrdersByDate] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: "2024-01-01",
    end: "2030-12-31",
  });
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [summaryRes, ordersRes, customersRes] = await Promise.all([
        api.get("/metrics/summary"),
        api.get("/metrics/orders-by-date", {
          params: { start: dateRange.start, end: dateRange.end },
        }),
        api.get("/metrics/top-customers"),
      ]);

      setSummary(summaryRes.data);
      setOrdersByDate(ordersRes.data);
      setTopCustomers(customersRes.data);
    } catch (err) {
      console.error("Error loading metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      await api.post("/ingest/run");
      await fetchAll();
      alert("Sync completed!");
    } catch (err) {
      console.error("Sync error:", err);

      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Unknown error";

      alert("Sync failed: " + msg);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bg = "#020617";

  return (
    <div style={{ minHeight: "100vh", background: bg, color: "white" }}>
      {/* Top bar */}
      <div
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid #1f2937",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background:
            "linear-gradient(to right, rgba(56,189,248,0.1), rgba(129,140,248,0.08))",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>ShopPulse</h2>
          <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
            Multi-tenant Shopify insights
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={handleSync}
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              border: "none",
              background: "#22c55e",
              color: "#011627",
              fontSize: "0.8rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ⟳ Sync Shopify Data
          </button>
          <button
            onClick={onLogout}
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              border: "1px solid #4b5563",
              background: "transparent",
              color: "#e5e7eb",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 24px" }}>
        {/* Date filters */}
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
            Orders by Date Range:
          </span>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((r) => ({ ...r, start: e.target.value }))
            }
            style={{
              padding: "4px 8px",
              borderRadius: "8px",
              border: "1px solid #4b5563",
              background: "#020617",
              color: "white",
              fontSize: "0.8rem",
            }}
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((r) => ({ ...r, end: e.target.value }))
            }
            style={{
              padding: "4px 8px",
              borderRadius: "8px",
              border: "1px solid #4b5563",
              background: "#020617",
              color: "white",
              fontSize: "0.8rem",
            }}
          />
          <button
            onClick={fetchAll}
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              border: "none",
              background: "#38bdf8",
              color: "#020617",
              fontSize: "0.8rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Apply
          </button>
          {loading && (
            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
              Loading metrics...
            </span>
          )}
        </div>

        {/* KPI cards */}
        {summary && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <KpiCard
              label="Total Customers"
              value={summary.totalCustomers}
              subtitle="Unique customer records"
            />
            <KpiCard
              label="Total Orders"
              value={summary.totalOrders}
              subtitle="All ingested orders"
            />
            <KpiCard
              label="Total Revenue"
              value={`₹${summary.totalRevenue.toFixed(2)}`}
              subtitle="Sum of order totals"
            />
          </div>
        )}

        {/* Charts + Top customers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.2fr",
            gap: "16px",
            alignItems: "stretch",
          }}
        >
          {/* Revenue chart */}
          <div
            style={{
              background: "#020617",
              borderRadius: "16px",
              border: "1px solid #1f2937",
              padding: "16px",
              minHeight: "260px",
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              <h3 style={{ margin: 0 }}>Revenue Trend</h3>
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                Orders grouped by date
              </span>
            </div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={ordersByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #4b5563",
                      fontSize: "0.8rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top customers */}
          <div
            style={{
              background: "#020617",
              borderRadius: "16px",
              border: "1px solid #1f2937",
              padding: "16px",
              minHeight: "260px",
              overflow: "hidden",
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              <h3 style={{ margin: 0 }}>Top Customers by Spend</h3>
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                Top 5 based on revenue
              </span>
            </div>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.8rem",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid #1f2937" }}>
                    <th style={{ textAlign: "left", padding: "6px" }}>
                      Customer
                    </th>
                    <th style={{ textAlign: "left", padding: "6px" }}>Email</th>
                    <th style={{ textAlign: "right", padding: "6px" }}>
                      Spend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c) => (
                    <tr
                      key={c.customerId}
                      style={{ borderBottom: "1px solid #111827" }}
                    >
                      <td style={{ padding: "6px" }}>{c.name}</td>
                      <td style={{ padding: "6px", color: "#9ca3af" }}>
                        {c.email}
                      </td>
                      <td style={{ padding: "6px", textAlign: "right" }}>
                        ₹{c.totalSpend.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {topCustomers.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        style={{
                          padding: "8px",
                          color: "#6b7280",
                          textAlign: "center",
                        }}
                      >
                        No data yet. Run a sync to pull Shopify orders.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, subtitle }) => (
  <div
    style={{
      background:
        "radial-gradient(circle at top, rgba(56,189,248,0.3), transparent 60%), #020617",
      borderRadius: "16px",
      border: "1px solid #1f2937",
      padding: "12px 14px",
    }}
  >
    <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{label}</div>
    <div style={{ fontSize: "1.4rem", fontWeight: 600, margin: "4px 0" }}>
      {value}
    </div>
    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{subtitle}</div>
  </div>
);

export default Dashboard;
