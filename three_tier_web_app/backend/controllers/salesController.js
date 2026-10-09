const db = require("../config/db");

// POST: Create a sales invoice with product items
exports.createSalesInvoice = (req, res) => {
  const {
    invoiceDate,
    invoiceNo,
    customerId,
    customerName,
    paymentMode,
    totalTax,
    totalDiscount,
    totalPayable,
    paidAmount,
    dueAmount,
    status,
    mobile_no,
    products
  } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ success: false, message: "Products array is missing or empty" });
  }

  const invoiceSQL = `
    INSERT INTO sales_invoice (
      invoice_date, invoice_no, customer_id, customer_name, payment_mode,
      total_tax, total_discount, grand_total, paid_amount, due_amount,
      status, mobile_no
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const invoiceData = [
    invoiceDate,
    invoiceNo,
    customerId,
    customerName,
    paymentMode,
    totalTax,
    totalDiscount,
    totalPayable,
    paidAmount,
    dueAmount,
    status,
    mobile_no
  ];

  db.query(invoiceSQL, invoiceData, (err, result) => {
    if (err) {
      console.error("❌ Invoice creation failed:", err);
      return res.status(500).json({ success: false, message: "Invoice creation failed", error: err.message });
    }

    const invoiceId = result.insertId;

    const productSQL = `
      INSERT INTO sales_invoice_items (
        invoice_id, product_id, itemNumber, itemName,
        quantity, unitPrice, discount, taxPercentage, total
      ) VALUES ?
    `;

    const productValues = products.map((p) => [
      invoiceId,
      p.productID || null,
      p.itemNumber || null,
      p.itemName,
      p.quantity,
      p.unitPrice,
      p.discount,
      p.taxPercentage || 0,
      p.total
    ]);

    db.query(productSQL, [productValues], (err2) => {
      if (err2) {
        console.error("❌ Product insert failed:", err2);
        return res.status(500).json({ success: false, message: "Product insert failed", error: err2.message });
      }

      res.status(200).json({
        success: true,
        message: "Sales Invoice created successfully",
        invoiceId: invoiceId
      });
    });
  });
};

// GET: All sales invoices with items
exports.getSalesInvoices = (req, res) => {
  const invoiceSQL = "SELECT * FROM sales_invoice ORDER BY created_at DESC";
  const itemSQL = "SELECT * FROM sales_invoice_items";

  db.query(invoiceSQL, (err, invoices) => {
    if (err) {
      console.error("❌ Error fetching invoices:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch invoices", error: err.message });
    }

    db.query(itemSQL, (err2, items) => {
      if (err2) {
        return res.status(500).json({ success: false, message: "Failed to fetch items", error: err2.message });
      }

      const combined = invoices.map((invoice) => {
        const relatedItems = items.filter(i => i.invoice_id === invoice.invoice_id);
        return { ...invoice, products: relatedItems };
      });

      res.status(200).json({ success: true, invoices: combined });
    });
  });
};
