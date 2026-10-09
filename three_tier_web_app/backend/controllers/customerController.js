const db = require("../config/db");

// GET: All customers
exports.getAllCustomers = (req, res) => {
  const sql = "SELECT * FROM customers";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send("DB Error");
    res.json(results);
  });
};

// GET: Customer by phone number
exports.getCustomerByPhone = (req, res) => {
  const phone = req.params.phoneMobile;
  const sql = "SELECT * FROM customers WHERE phoneMobile = ?";
  db.query(sql, [phone], (err, results) => {
    if (err) return res.status(500).json({ error: "DB Error" });
    if (results.length === 0) return res.status(404).json({ message: "Customer not found" });
    res.json(results[0]);
  });
};

// POST: Add new customer
exports.addCustomer = (req, res) => {
  const customer = req.body;
  const checkSQL = "SELECT * FROM customers WHERE phoneMobile = ?";
  db.query(checkSQL, [customer.phoneMobile], (err, results) => {
    if (err) return res.status(500).send("Check failed");
    if (results.length > 0) return res.status(400).json({ message: "exists" });

    const insertSQL = "INSERT INTO customers (fullName, phoneMobile, address, email) VALUES (?, ?, ?, ?)";
    db.query(insertSQL, [customer.fullName, customer.phoneMobile, customer.address, customer.email], (err2, result) => {
      if (err2) return res.status(500).send("Insert failed");
      res.status(200).json({ message: "success", id: result.insertId });
    });
  });
};

// PUT: Update customer by ID
exports.updateCustomer = (req, res) => {
  const id = req.params.id;
  const customer = req.body;
  const sql = "UPDATE customers SET ? WHERE customer_id = ?";
  db.query(sql, [customer, id], (err, result) => {
    if (err) return res.status(500).send("Update failed");
    res.status(200).json({ message: "updated" });
  });
};

// DELETE: Remove customer by ID
exports.deleteCustomer = (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM customers WHERE customer_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send("Delete failed");
    res.status(200).json({ message: "deleted" });
  });
};
