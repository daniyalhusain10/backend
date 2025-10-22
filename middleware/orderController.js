const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/user_model");

// 🛒 Create a new order
const createOrder = asyncHandler(async (req, res) => {
  const { userId, items, shippingInfo, totalAmount, shippingFee = 0 } = req.body;

  // --- Validation ---
  if (userId) {
    const userExists = await User.findById(userId);
    if (!userExists)
      return res.status(404).json({ success: false, message: "User not found" });
  }

  if (!items || !Array.isArray(items) || items.length === 0)
    return res
      .status(400)
      .json({ success: false, message: "Order items are required" });

  if (!shippingInfo || !shippingInfo.firstName || !shippingInfo.phone)
    return res
      .status(400)
      .json({ success: false, message: "Valid shipping info required" });

  if (!totalAmount || totalAmount <= 0)
    return res.status(400).json({
      success: false,
      message: "Total amount must be greater than 0",
    });

  // --- Fetch all products in the order at once ---
  const productIds = items.map((item) => item.productId);
  const productsFromDB = await Product.find({ _id: { $in: productIds } });

  // --- Enhance items with product info ---
  const enhancedItems = [];
  const images = [];

  for (const item of items) {
    const product = productsFromDB.find(
      (p) => p._id.toString() === item.productId
    );
    if (!product) continue;

    const image =
      product.imageUrl || product.images?.[0]?.url || product.images?.[0] || "";

    images.push(image);

    // ✅ Safe item structure: if color is missing, default to null
    enhancedItems.push({
      ...item,
      name: product.name,
      price: product.price,
      image,
      color: item.color || null, // ✅ handle missing color gracefully
    });
  }

  if (enhancedItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid products found in order",
    });
  }

  // --- Create and save order ---
  const newOrder = new Order({
    userId: userId || null, // null if guest
    items: enhancedItems,
    shippingInfo,
    totalAmount,
    shippingFee,
    images,
  });

  const savedOrder = await newOrder.save();

  res.status(201).json({
    success: true,
    message: "Order created successfully!",
    order: savedOrder,
  });
});

// 🔍 Get all orders (optionally by user)
// ... baqi imports yahan hain ...
const mongoose = require("mongoose"); 
// ...

// 🔍 Get all orders (optionally by user)
const getOrders = asyncHandler(async (req, res) => {
  const queryUserId = req.query.userId;
  let filter = {}; // Shuru mein filter empty hai (sab orders ke liye)

  // 🚨 CRITICAL CORRECTION: Validate only if queryUserId is present
  if (queryUserId) {
    // 1. Check for the invalid client-side string literals ("null" ya "undefined")
    if (queryUserId === "null" || queryUserId === "undefined") {
        // Agar logged-out user ki taraf se invalid string aaye toh empty array return karo
        // (Yeh Mongoose CastError ko rokta hai)
        return res.status(200).json({ success: true, count: 0, orders: [] });
    }

    // 2. Check if the string is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(queryUserId)) {
        // Agar format galat ho, toh 400 Bad Request error bhejo
        return res.status(400).json({ 
            success: false, 
            message: "Invalid user ID format provided." 
        });
    }

    // 3. Agar validation pass ho jaaye, toh filter set kar do
    filter = { userId: queryUserId };
  } 
  // Agar queryUserId bheja hi nahi gaya, toh filter {} rahega (sab orders fetch honge)

  const orders = await Order.find(filter) // Ab filter use hoga
    .populate("userId", "username email")
    .populate("items.productId", "name price")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: orders.length, orders });
});

// ... baqi module.exports yahan hain ...
// 🔍 Get single order by ID
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate("userId", "username email")
    .populate("items.productId", "name price");

  if (!order)
    return res
      .status(404)
      .json({ success: false, message: "Order not found" });

  res.status(200).json({ success: true, order });
});

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
};
