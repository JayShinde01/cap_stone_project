INSERT INTO items (itemName, itemNumber, unitPrice, stock, discount, tax) VALUES
('Clutch Plate', 'CP001', 1200.00, 50, 5.00, 18.00),
('Brake Shoe', 'BS002', 450.00, 100, 2.50, 18.00),
('Engine Oil Filter', 'EOF003', 320.00, 80, 3.00, 18.00),
('Hydraulic Pump', 'HP004', 2450.00, 20, 4.00, 18.00),
('Steering Wheel', 'SW005', 1350.00, 30, 5.00, 18.00),
('Air Cleaner Assembly', 'AC006', 950.00, 25, 3.50, 18.00),
('Fuel Injection Nozzle', 'FIN007', 1750.00, 40, 2.00, 18.00),
('Gearbox Housing', 'GH008', 5200.00, 10, 6.00, 18.00),
('Front Axle Shaft', 'FAS009', 3300.00, 15, 4.50, 18.00),
('Radiator Fan', 'RF010', 800.00, 35, 2.00, 18.00);


INSERT INTO customers (fullName, phoneMobile, address, email) VALUES
('Rohan Rode', '9876543210', 'Solapur, Maharashtra', 'rohan.rode@example.com'),
('Jay Shinde', '9876543211', 'Satara, Maharashtra', 'jay.shinde@example.com'),
('Onkar Shinde', '9876543212', 'Pune, Maharashtra', 'onkar.shinde@example.com'),
('Jyotiram Koakne', '9876543213', 'Kolhapur, Maharashtra', 'jyotiram.koakne@example.com'),
('Atharv Ghatge', '9876543214', 'Sangli, Maharashtra', 'atharv.ghatge@example.com'),
('Abhijeet Kamble', '9876543215', 'Solapur, Maharashtra', 'abhijeet.kamble@example.com'),
('Pramod Gherade', '9876543216', 'Latur, Maharashtra', 'pramod.gherade@example.com'),
('Shubham Mane', '9876543217', 'Karad, Maharashtra', 'shubham.mane@example.com'),
('Karan Gite', '9876543218', 'Nashik, Maharashtra', 'karan.gite@example.com'),
('Abhay Gaikwad', '9876543219', 'Aurangabad, Maharashtra', 'abhay.gaikwad@example.com');
INSERT INTO sales_invoice (
  invoice_date, invoice_no, customer_id, customer_name,
  payment_mode, total_tax, total_discount, grand_total,
  paid_amount, due_amount, status, mobile_no
) VALUES
('2025-07-14', 'INV001', 1, 'Rohan Rode', 'Cash', 150.00, 50.00, 1600.00, 1600.00, 0.00, 'Paid', '9876543210'),
('2025-07-13', 'INV002', 2, 'Jay Shinde', 'Online', 200.00, 100.00, 2100.00, 2000.00, 100.00, 'Partial', '9876543211');
