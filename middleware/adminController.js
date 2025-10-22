
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel"); 
const Product = require("../models/productModel"); 

const generateTokenAndSetCookie = (adminId, res) => {
    const token = jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    res.cookie("adminToken", token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, 
    });
};

//  Admin Login ---------------------
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    generateTokenAndSetCookie(admin._id, res); 

   res.json({
    success: true,
    message: "Login successful",
    token: jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "7d" }),
    admin: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' },
});
});


// Get all products
const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// Add new product
const addProduct = asyncHandler(async (req, res) => {
    const newProduct = await Product.create(req.body);
    res.status(201).json({ success: true, product: newProduct });
});

// Update product
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ success: true, product });
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ sucddddcess: true, message: `Product ${req.params.id} deleted` });
});

module.exports = { loginAdmin, getProducts, addProduct, updateProduct, deleteProduct };