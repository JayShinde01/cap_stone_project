const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config(); // Loads .env variables

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ MySQL DB connection
require("./config/db"); // Make sure db.js exports a connected instance

// ✅ CORS setup
app.use(cors({
  origin: "*", // Replace with your frontend domain in production
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ✅ JSON parsing
app.use(bodyParser.json());

// ✅ Static folder for uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Create uploads folder if missing
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const isValidMime = allowedTypes.test(file.mimetype);
    isValidExt && isValidMime
      ? cb(null, true)
      : cb(new Error("Only images (jpeg, jpg, png, gif) are allowed"));
  },
});

// ✅ API Routes
const itemRoutes = require("./routes/itemRoutes");
const customerRoutes = require("./routes/customerRoutes");
const salesRoutes = require("./routes/salesRoutes");

app.use("/api/items", itemRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/sales", salesRoutes);

// ✅ Health check route
app.get("/", (req, res) => res.send("🚀 MySQL-based backend is running!"));

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
