const db = require("../config/db");

// GET: All items
exports.getAllItems = (req, res) => {
  db.query("SELECT * FROM items", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// GET: Item by Item Number
exports.getItemByNumber = (req, res) => {
  const sql = "SELECT * FROM items WHERE itemNumber = ?";
  db.query(sql, [req.params.itemNumber], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Item not found" });
    res.json(results[0]);
  });
};

// POST: Create new item
exports.createItem = (req, res) => {
  
  const { itemName, itemNumber, unitPrice, stock, discount, tax } = req.body;
  const sql = `
    INSERT INTO items (itemName, itemNumber, unitPrice, stock, discount, tax)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [itemName, itemNumber, unitPrice, stock, discount, tax], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Item added", itemId: result.insertId });
  });
};

// PUT: Update item by ID
exports.updateItem = (req, res) => {
  const id = req.params.id;
  console.log(req.body);
  console.log(req.params.id);
  
  
  const sql = "UPDATE items SET ? WHERE item_id = ?";
  db.query(sql, [req.body, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item updated" });
  });
};

// DELETE: Remove item
exports.deleteItem = (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM items WHERE item_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  });
};

// PUT: Update stock (deduct sold quantity)
exports.updateStock = (req, res) => {
  console.log(req.body);
  
  const id = req.params.id;
  const { quantitySold } = req.body;
console.log(quantitySold);

  db.query("SELECT stock FROM items WHERE item_id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Item not found" });

    const currentStock = results[0].stock;
    const newStock = currentStock - quantitySold;

    db.query("UPDATE items SET stock = ? WHERE item_id = ?", [newStock, id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: "Stock updated", stock: newStock });
    });
  });
};
