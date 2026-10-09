const express = require("express");
const router = express.Router();
const {
  createSalesInvoice,
  getSalesInvoices
} = require("../controllers/salesController"); // make sure filename matches

// Route to create a new sales invoice (POST)
router.post("/", createSalesInvoice);

// Route to get all sales invoices (GET)
router.get("/", getSalesInvoices);

module.exports = router;
