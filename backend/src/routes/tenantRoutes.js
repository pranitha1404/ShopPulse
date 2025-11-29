const express = require("express");
const { createTenant, listTenants } = require("../controllers/tenantController");
const router = express.Router();

router.post("/", createTenant);
router.get("/", listTenants);

module.exports = router;
