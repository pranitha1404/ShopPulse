const axios = require("axios");

function makeShopifyClient(tenant) {
  if (!tenant || !tenant.shopDomain || !tenant.accessToken) {
    throw new Error("Tenant missing shopDomain or accessToken");
  }

  const baseURL = `https://${tenant.shopDomain}/admin/api/2024-01`;

  return axios.create({
    baseURL,
    headers: {
      "X-Shopify-Access-Token": tenant.accessToken,
      "Content-Type": "application/json",
    },
  });
}

async function fetchCustomers(tenant) {
  const client = makeShopifyClient(tenant);
  const res = await client.get("/customers.json", { params: { limit: 250 } });
  return res.data.customers || [];
}

async function fetchProducts(tenant) {
  const client = makeShopifyClient(tenant);
  const res = await client.get("/products.json", { params: { limit: 250 } });
  return res.data.products || [];
}

async function fetchOrders(tenant) {
  const client = makeShopifyClient(tenant);
  const res = await client.get("/orders.json", {
    params: { status: "any", limit: 250 },
  });
  return res.data.orders || [];
}

module.exports = {
  fetchCustomers,
  fetchProducts,
  fetchOrders,
};
