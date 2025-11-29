const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const { ingestShopifyDataForTenant } = require("./ingestionService");

const prisma = new PrismaClient();

/**
 * Runs a Shopify sync for all tenants on a schedule.
 * For demo: every 30 minutes.
 */
function startSyncScheduler() {
  // “*/30 * * * *” = every 30 minutes
  cron.schedule("*/30 * * * *", async () => {
    console.log("⏰ Cron: starting scheduled Shopify sync...");

    try {
      const tenants = await prisma.tenant.findMany();
      if (!tenants.length) {
        console.log("⏰ Cron: no tenants found, skipping.");
        return;
      }

      for (const t of tenants) {
        console.log(`⏰ Cron: syncing tenant ${t.id} (${t.shopDomain})`);
        await ingestShopifyDataForTenant(t.id);
      }

      console.log("✅ Cron: sync finished for all tenants");
    } catch (err) {
      console.error("❌ Cron sync failed:", err);
    }
  });
}

module.exports = { startSyncScheduler };
