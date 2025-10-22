// File: ./routes/adminRoutes.js

const express = require("express");
const router = express.Router();

// Import the functions from the separate controller file
const { 
    loginAdmin, 
    getProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct 
} = require("../middleware/adminController");

// Admin login
// FIX: Changed route to /login for cleaner mounting (e.g., /api/admin/login)
router.post("/admin-login", loginAdmin); 

// Product CRUD
router.get("/products", getProducts);
router.post("/products", addProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

module.exports = router;