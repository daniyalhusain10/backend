const mongoose = require("mongoose");

// --- Sub-schema for individual items ---
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  size: { type: String }, // optional, if your products have sizes

  color: {
    type: String,
    enum: [
      "black",
      "white",
      "red",
      "blue",
      "green",
      "yellow",
      "purple",
      "gray",
      "none"
    ],
    required: false, // only required if color is selected
  },
});

// --- Sub-schema for shipping info ---
const shippingInfoSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  zipcode: { type: String },
  country: { type: String, required: true },
  phone: { type: String, required: true },
});

// --- Main order schema ---
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
      required: false, // optional
    },
    
    items: [orderItemSchema],
    shippingInfo: shippingInfoSchema,
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    images: [{ type: String }], // optional, if you want to store images
    shippingFee: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
