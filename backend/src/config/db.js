const { PrismaClient } = require("@prisma/client");

// Pass an empty config object so Prisma doesn't try to read from undefined
const prisma = new PrismaClient({});

module.exports = prisma;
