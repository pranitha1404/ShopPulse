const {
  getSummary,
  getOrdersByDate,
  getTopCustomers,
} = require("../services/metricsService");

exports.getSummary = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const data = await getSummary(tenantId);
    res.json(data);
  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ message: "Failed to fetch summary" });
  }
};

exports.getOrdersByDate = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { start, end } = req.query;
    const data = await getOrdersByDate(tenantId, start, end);
    res.json(data);
  } catch (err) {
    console.error("OrdersByDate error:", err);
    res.status(500).json({ message: "Failed to fetch orders by date" });
  }
};

exports.getTopCustomers = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const data = await getTopCustomers(tenantId);
    res.json(data);
  } catch (err) {
    console.error("TopCustomers error:", err);
    res.status(500).json({ message: "Failed to fetch top customers" });
  }
};
