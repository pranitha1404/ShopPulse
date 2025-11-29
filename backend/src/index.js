require("dotenv").config();
const { startSyncScheduler } = require("./services/syncScheduler");

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const ingestRoutes = require("./routes/ingestRoutes");
const metricsRoutes = require("./routes/metricsRoutes");

require("./services/syncScheduler"); // runs background sync

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_, res) => res.send("Xeno Shopify Ingestion Backend Running 🚀"));
app.use("/auth", authRoutes);
app.use("/tenants", tenantRoutes);
app.use("/ingest", ingestRoutes);
app.use("/metrics", metricsRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("Server started ✔");
  // start cron scheduler after server is up
  startSyncScheduler();
});
