const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const register = async (req, res) => {
  try {
    const { email, password, tenantId } = req.body;

    if (!email || !password || !tenantId)
      return res.status(400).json({ message: "email, password, tenantId required" });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { email, password: hashed, tenantId: Number(tenantId) }
    });

    res.json({ message: "User Registered Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Register Failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, tenantId: user.tenantId });
  } catch {
    res.status(500).json({ message: "Login Failed" });
  }
};

module.exports = { register, login };
