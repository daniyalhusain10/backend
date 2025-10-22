const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require("../middleware/showOrderController");

// 🛒 Create a new order
router.post("/", createOrder);

// 📦 Get all orders
router.get("/", getOrders);

// 🔍 Get single order by ID
router.get("/:id", getOrderById);

// 🔄 Update an order
router.put("/:id", updateOrder);

// 🗑️ Delete an order
router.delete("/:id", deleteOrder);

module.exports = router;
