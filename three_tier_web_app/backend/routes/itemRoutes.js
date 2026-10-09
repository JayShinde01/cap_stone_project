const express = require("express");
const router = express.Router();
const {
  getAllItems,
  getItemByNumber,
  createItem,
  updateItem,
  deleteItem,
  updateStock
} = require("../controllers/itemController");

router.get("/", getAllItems);
router.get("/:itemNumber", getItemByNumber);
router.post("/", createItem);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);
router.put("/update-stock/:id", updateStock);

module.exports = router;
