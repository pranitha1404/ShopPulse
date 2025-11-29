require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN;
  const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

  const ADMIN_EMAIL = "admin@example.com";
  const ADMIN_PASSWORD = "password123";

  if (!SHOP_DOMAIN || !ACCESS_TOKEN) {
    throw new Error(
      "SHOPIFY_SHOP_DOMAIN or SHOPIFY_ACCESS_TOKEN not set in .env"
    );
  }

  console.log("🌱 Seeding tenant + admin user...");

  const tenant = await prisma.tenant.upsert({
    where: { shopDomain: SHOP_DOMAIN },
    update: { accessToken: ACCESS_TOKEN },
    create: {
      name: "ShopPulse Demo Store",
      shopDomain: SHOP_DOMAIN,
      accessToken: ACCESS_TOKEN,
    },
  });

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: hashed, tenantId: tenant.id },
    create: {
      email: ADMIN_EMAIL,
      password: hashed,
      tenantId: tenant.id,
    },
  });

  console.log("✅ Database ready!");
  console.log(`Tenant id: ${tenant.id}, Admin id: ${user.id}`);
  console.log("Login -> admin@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
