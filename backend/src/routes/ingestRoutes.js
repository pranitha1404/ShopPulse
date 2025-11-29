const express = require("express");
const requireAuth = require("../middleware/authMiddleware");
const { runIngestion } = require("../controllers/ingestController");
const router = express.Router();

router.post("/run", requireAuth, runIngestion);

module.exports = router;
