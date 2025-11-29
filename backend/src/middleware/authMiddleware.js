const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // If there IS a token, try to verify it
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // decoded should contain user info + tenantId if you set it when signing
      req.user = decoded;
      return next();
    } catch (err) {
      // In demo mode, if token is invalid, just fall through and use default user
      console.log("JWT invalid, falling back to demo user");
    }
  }

  // 🎯 Demo fallback: allow request with default admin + tenant 1
  req.user = {
    id: 1,
    tenantId: 1,
    role: "admin",
  };

  return next();
};
