const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
} = require("../middleware/orderController");

// 🛒 Create a new order (user)
router.post("/", createOrder);

// 📦 Get all orders or orders for a specific user (query: ?userId=...)
router.get("/", getOrders);

// 🔍 Get single order by ID
router.get("/:id", getOrderById);



module.exports = router;
