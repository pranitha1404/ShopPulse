const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getSummary(tenantId) {
  const [customerCount, orderCount, revenueAgg] = await Promise.all([
    prisma.customer.count({ where: { tenantId } }),
    prisma.order.count({ where: { tenantId } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true }, // 🔑 use totalAmount
      where: { tenantId },
    }),
  ]);

  return {
    totalCustomers: customerCount,
    totalOrders: orderCount,
    totalRevenue: revenueAgg._sum.totalAmount || 0,
  };
}

async function getOrdersByDate(tenantId, start, end) {
  const rows = await prisma.order.groupBy({
    by: ["orderDate"],
    where: {
      tenantId,
      orderDate: {
        gte: new Date(start),
        lte: new Date(end),
      },
    },
    _sum: {
      totalAmount: true, // 🔑 use totalAmount
    },
    orderBy: {
      orderDate: "asc",
    },
  });

  return rows.map((r) => ({
    date: r.orderDate.toISOString().slice(0, 10),
    revenue: r._sum.totalAmount || 0,
  }));
}

async function getTopCustomers(tenantId, limit = 5) {
  const rows = await prisma.order.groupBy({
    by: ["customerId"],
    where: {
      tenantId,
      customerId: { not: null },
    },
    _sum: { totalAmount: true }, // 🔑 use totalAmount
    orderBy: { _sum: { totalAmount: "desc" } },
    take: limit,
  });

  const ids = rows.map((r) => r.customerId);

  const customers = await prisma.customer.findMany({
    where: { id: { in: ids } },
  });

  const map = new Map();
  for (const c of customers) {
    map.set(c.id, c);
  }

  return rows.map((r) => {
    const c = map.get(r.customerId);
    const name = [c?.firstName, c?.lastName].filter(Boolean).join(" ") || "N/A";
    return {
      customerId: r.customerId,
      name,
      email: c?.email || "",
      totalSpend: r._sum.totalAmount || 0,
    };
  });
}

module.exports = {
  getSummary,
  getOrdersByDate,
  getTopCustomers,
};
