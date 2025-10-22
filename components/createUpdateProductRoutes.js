const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../middleware/productController.js");
const { uploadArray } = require("../middleware/upload.js");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", uploadArray, createProduct);
router.put("/:id", uploadArray, updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
