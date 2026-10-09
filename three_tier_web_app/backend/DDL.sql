create database db_inventory;
use db_inventory;
CREATE TABLE IF NOT EXISTS customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(100),
  phoneMobile VARCHAR(20) UNIQUE,
  address TEXT,
  email VARCHAR(100)
);
CREATE TABLE IF NOT EXISTS items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  itemName VARCHAR(100),
  itemNumber VARCHAR(50) UNIQUE,
  unitPrice DECIMAL(10,2),
  stock INT,
  discount DECIMAL(5,2),
  tax DECIMAL(5,2)
);
ALTER TABLE items
ADD COLUMN status VARCHAR(20) DEFAULT 'Active',
ADD COLUMN imageURL VARCHAR(255);

CREATE TABLE IF NOT EXISTS sales_invoice (
  invoice_id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_date DATE,
  invoice_no VARCHAR(50),
  customer_id INT,
  customer_name VARCHAR(100),
  payment_mode VARCHAR(50),
  total_tax DECIMAL(10,2),
  total_discount DECIMAL(10,2),
  grand_total DECIMAL(10,2),
  paid_amount DECIMAL(10,2),
  due_amount DECIMAL(10,2),
  status VARCHAR(50),
  mobile_no VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT,
  product_id INT,
  itemNumber VARCHAR(50),
  itemName VARCHAR(100),
  quantity INT,
  unitPrice DECIMAL(10,2),
  discount DECIMAL(5,2),
  taxPercentage DECIMAL(5,2),
  total DECIMAL(10,2),
  FOREIGN KEY (invoice_id) REFERENCES sales_invoice(invoice_id)
);
