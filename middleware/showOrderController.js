const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/user_model");

// 🛒 Create a new order (admin can create manually)
const createOrder = asyncHandler(async (req, res) => {
  const { userId, items, shippingInfo, totalAmount, shippingFee = 0 } = req.body;

  if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });
  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ success: false, message: "Order items are required" });
  if (!shippingInfo || !shippingInfo.firstName || !shippingInfo.phone)
    return res.status(400).json({ success: false, message: "Valid shipping info required" });
  if (!totalAmount || totalAmount <= 0)
    return res.status(400).json({ success: false, message: "Total amount must be greater than 0" });

  const userExists = await User.findById(userId);
  if (!userExists) return res.status(404).json({ success: false, message: "User not found" });

  for (const item of items) {
    const productExists = await Product.findById(item.productId);
    if (!productExists)
      return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
  }

  const newOrder = new Order({ userId, items, shippingInfo, totalAmount, shippingFee });
  const savedOrder = await newOrder.save();

  res.status(201).json({ success: true, message: "Order created successfully!", order: savedOrder });
});

// 🔍 Get all orders
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("userId", "name email")
    .populate("items.productId", "name price");

  res.status(200).json({ success: true, count: orders.length, orders });
});

// 🔍 Get single order by ID
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id)
    .populate("userId", "name email")
    .populate("items.productId", "name price");

  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  res.status(200).json({ success: true, order });
});

// 🔄 Update order
const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, items, shippingInfo, totalAmount, shippingFee, orderStatus, paymentStatus } = req.body;

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  if (userId) order.userId = userId;
  if (items) order.items = items;
  if (shippingInfo) order.shippingInfo = shippingInfo;
  if (totalAmount) order.totalAmount = totalAmount;
  if (shippingFee) order.shippingFee = shippingFee;
  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  const updatedOrder = await order.save();
  res.status(200).json({ success: true, message: "Order updated successfully", order: updatedOrder });
});

// 🗑️ Delete order
const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  await order.deleteOne(); // ✅ correct
  res.status(200).json({ success: true, message: "Order deleted successfully" });
});

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
// this is for full crud from  , admin se handle hoga