const { ingestShopifyDataForTenant } = require("../services/ingestionService");

exports.runIngestion = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    await ingestShopifyDataForTenant(tenantId);
    return res.json({ message: "Ingestion completed" });
  } catch (err) {
    // Log full error on server
    console.error("❌ Ingestion error (full):");
    console.error(err);

    // Build a detailed but safe message for frontend
    let details = "";

    if (err.response) {
      // Axios / Shopify error
      const status = err.response.status;
      const data = err.response.data;
      details = `Shopify API error ${status}: ${JSON.stringify(data)}`;
    } else if (err.message) {
      details = err.message;
    } else {
      details = "Unknown ingestion error";
    }

    return res
      .status(500)
      .json({ message: "Ingestion failed", error: details });
  }
};
