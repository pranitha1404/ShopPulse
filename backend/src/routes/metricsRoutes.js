const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const metricsController = require("../controllers/metricsController");

// GET /api/metrics/summary
router.get("/summary", authMiddleware, metricsController.getSummary);

// GET /api/metrics/orders-by-date?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get(
  "/orders-by-date",
  authMiddleware,
  metricsController.getOrdersByDate
);

// GET /api/metrics/top-customers
router.get(
  "/top-customers",
  authMiddleware,
  metricsController.getTopCustomers
);

module.exports = router;
