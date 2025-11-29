const prisma = require("../config/db");
const bcrypt = require("bcryptjs");

const createTenant = async (req, res) => {
  try {
    const { name, shopDomain, accessToken, adminEmail, adminPassword } = req.body;

    if (!name || !shopDomain || !accessToken || !adminEmail || !adminPassword)
      return res.status(400).json({ message: "All fields required" });

    const exists = await prisma.tenant.findUnique({ where: { shopDomain } });
    if (exists) return res.status(400).json({ message: "Tenant already exists" });

    const tenant = await prisma.tenant.create({
      data: { name, shopDomain, accessToken }
    });

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 10),
        tenantId: tenant.id
      }
    });

    res.json({ message: "Tenant Created", tenantId: tenant.id });
  } catch {
    res.status(500).json({ message: "Tenant Creation Failed" });
  }
};

const listTenants = async (_, res) => {
  const tenants = await prisma.tenant.findMany();
  res.json(tenants);
};

module.exports = { createTenant, listTenants };
