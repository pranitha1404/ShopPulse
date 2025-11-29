const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const shopify = require("./shopifyService");

async function ingestShopifyDataForTenant(tenantId) {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);

    console.log(
      `🚀 Ingestion start for tenant ${tenant.id} (${tenant.shopDomain})`
    );

    // =========== CUSTOMERS ===========
    const customers = await shopify.fetchCustomers(tenant);
    console.log("📥 Shopify customers:", customers.length);

    for (const c of customers) {
      await prisma.customer.upsert({
        where: { shopifyId: String(c.id) },
        update: {
          email: c.email,
          firstName: c.first_name,
          lastName: c.last_name,
          tenantId: tenant.id,
        },
        create: {
          shopifyId: String(c.id),
          email: c.email,
          firstName: c.first_name,
          lastName: c.last_name,
          tenantId: tenant.id,
        },
      });
    }

    // =========== PRODUCTS (RESET + CREATE ONE-BY-ONE) ===========
    const products = await shopify.fetchProducts(tenant);
    console.log("📥 Shopify products:", products.length);

    // Delete old products for this tenant
    await prisma.product.deleteMany({
      where: { tenantId: tenant.id },
    });

    for (const p of products) {
      const price =
        p.variants && p.variants[0] && p.variants[0].price
          ? Number(p.variants[0].price)
          : 0;

      await prisma.product.create({
        data: {
          shopifyId: String(p.id),
          title: p.title,
          price,
          tenantId: tenant.id,
        },
      });
    }

    // =========== ORDERS ===========
    const orders = await shopify.fetchOrders(tenant);
    console.log("📥 Shopify orders:", orders.length);

    for (const o of orders) {
      const customerShopifyId = o.customer ? String(o.customer.id) : null;
      let customerRecord = null;

      if (customerShopifyId) {
        customerRecord = await prisma.customer.findUnique({
          where: { shopifyId: customerShopifyId },
        });
      }

      const amount = Number(o.total_price || 0); // our main numeric field

      // Use created_at or fallback to now as orderDate
      const orderDate = o.created_at
        ? new Date(o.created_at)
        : new Date();

      await prisma.order.upsert({
        where: { shopifyId: String(o.id) },
        update: {
          totalAmount: amount,           // ✅ in your schema
          currency: o.currency || "INR", // ✅ previously accepted
          orderDate,                     // ✅ in your schema
          tenantId: tenant.id,
          customerId: customerRecord ? customerRecord.id : null,
        },
        create: {
          shopifyId: String(o.id),
          totalAmount: amount,
          currency: o.currency || "INR",
          orderDate,
          tenantId: tenant.id,
          customerId: customerRecord ? customerRecord.id : null,
        },
      });
    }

    console.log("✅ Ingestion done for tenant", tenant.id);
  } catch (err) {
    throw err; // controller will send details
  }
}

module.exports = { ingestShopifyDataForTenant };
