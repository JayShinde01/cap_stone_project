const express = require("express");
const router = express.Router();
const {
  getAllCustomers,
  getCustomerByPhone,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

router.get("/", getAllCustomers);
router.get("/:phoneMobile", getCustomerByPhone);
router.post("/", addCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

module.exports = router;
