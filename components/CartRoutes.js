// ✅ CartRoutes.js — LocalStorage Version (no MongoDB)
const express = require("express");
const router = express.Router();

// 🛒 GET Cart — just return empty (frontend handles localStorage)
router.get("/", async (req, res) => {
  try {
    // LocalStorage is managed on the frontend, so backend just returns empty or placeholder.
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 🛍️ POST Cart — acknowledge save (but do nothing)
router.post("/", async (req, res) => {
  try {
    const { cart } = req.body || {};

    if (!Array.isArray(cart)) {
      return res.status(400).json({ message: "Cart must be an array" });
    }

    // Normally would save to DB, but since we use localStorage, just respond OK
    res.json({ message: "Cart received successfully (local only)" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 🧼 DELETE Cart — acknowledge clear (but do nothing)
router.delete("/", async (req, res) => {
  try {
    res.json({ message: "Cart cleared (local only)" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
