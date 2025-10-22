const mongoose = require("mongoose");
const express = require("express");
const {
  getProducts,
  getProductById,
  deleteProduct,
  updateProductStock // <--- YOUR JSON-ONLY ROUTE
} = require("../middleware/productController.js"); // Adjust path if necessary

const router = express.Router();

// 1. Stock update route (JSON body required)
// This will run AFTER the global app.use(express.json()) in server.js
router.post('/update-stock', updateProductStock); 

// 2. GET and DELETE routes (No Body parsing required)
router.get("/", getProducts);
router.get("/:id", getProductById);
router.delete("/:id", deleteProduct);

module.exports = router;