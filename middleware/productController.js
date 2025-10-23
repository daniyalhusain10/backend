const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel.js');
const cloudinary = require('cloudinary').v2;
const mongoose = require("mongoose");
const mongoDb = require("../utils/mongDb.js")
// -------------------------------------------
// GET all products
const getProducts = asyncHandler(async (req, res) => {
  await mongoDb();
  const products = await Product.find({}).populate('user', 'username email');
  res.json({ products });
});

// GET product by ID
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error('Invalid product ID format');
  }

  const product = await Product.findById(id).populate('user', 'username email');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ product });
});

// CREATE product (✅ supports up to 5 images + colors)
const createProduct = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('At least one product image is required!');
  }

  const { name, price, description, category, stock, sizes, colors } = req.body;

  // Collect all Cloudinary URLs + IDs
  const imageList = req.files.map((file) => ({
    url: file.path,
    public_id: file.filename || file.public_id,
  }));

  const productData = {
    user: req.user?._id || null,
    name: name.trim(),
    price: parseFloat(price),
    description: description?.trim() || '',
    category: category?.trim() || 'general',
    stock: parseInt(stock) || 0,
    sizes: sizes ? JSON.parse(sizes) : [],
    colors: colors ? JSON.parse(colors) : [], // ✅ added color support
    images: imageList, // store all 5 image URLs
    imageUrl: imageList[0].url, // first image as primary thumbnail
    imagePublicId: imageList[0].public_id,
  };

  const product = new Product(productData);
  const createdProduct = await product.save();

  res.status(201).json({ success: true, product: createdProduct });
});

// UPDATE product (✅ handles image replacement + colors update)
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const updateData = {
    name: req.body.name?.trim() || product.name,
    price: parseFloat(req.body.price) || product.price,
    description: req.body.description?.trim() || product.description,
    category: req.body.category?.trim() || product.category,
    stock: parseInt(req.body.stock) || product.stock,
    sizes: req.body.sizes ? JSON.parse(req.body.sizes) : product.sizes,
    colors: req.body.colors ? JSON.parse(req.body.colors) : product.colors, // ✅ added color update
  };

  // If new images are uploaded
  if (req.files && req.files.length > 0) {
    // Delete old images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        try {
          await cloudinary.uploader.destroy(img.public_id);
        } catch (error) {
        }
      }
    }

    // Upload new images
    const newImages = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename || file.public_id,
    }));

    updateData.images = newImages;
    updateData.imageUrl = newImages[0].url;
    updateData.imagePublicId = newImages[0].public_id;
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, product: updatedProduct });
});

// DELETE product (✅ deletes all images)
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Delete all associated Cloudinary images
  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
      } catch (error) {
      }
    }
  }

  await Product.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Product and all images deleted successfully.',
  });
});

const updateProductStock = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Items array is required and must not be empty",
    });
  }

  try {
    for (const item of items) {
      const { productId, quantity } = item;

      // Validate productId
      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID: ${productId}`,
        });
      }

      // Validate quantity
      if (!quantity || typeof quantity !== "number" || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product ID ${productId}: ${quantity}`,
        });
      }

      // Find product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productId}`,
        });
      }

      // Check stock availability
      if (!product.stock || product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product "${product.name}". Available: ${product.stock || 0}`,
        });
      }

      // Subtract stock
      product.stock -= quantity;
      await product.save();
    }

    res.status(200).json({
      success: true,
      message: "✅ Stock updated successfully in the database.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during stock update.",
    });
  }
});
module.exports = {
  updateProductStock,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
