// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const userModel = require("../models/user_model.js");
const { redirectIfAuthenticated, protect, forgetPassword, verifyPassword } = require("../middleware/auth.js");

// ✅ Validate endpoint - WITHOUT middleware for clean validation
router.get("/validate", asyncHandler(async (req, res) => {
  try {
    const token = req.cookies.saveInfo;
    
    if (!token) {
      return res.json({ 
        loggedIn: false, 
        success: false,
        message: "No token" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.json({ 
        loggedIn: false, 
        success: false,
        message: "Invalid session" 
      });
    }

    res.json({ 
      loggedIn: true, 
      success: true,
      userId: user._id.toString(),
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    res.clearCookie("saveInfo");
    res.json({ 
      loggedIn: false, 
      success: false,
      message: "Invalid token" 
    });
  }
}));

// ✅ Login - Complete implementation
router.post("/login", redirectIfAuthenticated, asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // If already authenticated from middleware
    if (req.userId) {
      const user = await userModel.findById(req.userId).select("-password");
      return res.json({
        success: true,
        message: "Already logged in",
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    }

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password required" 
      });
    }

    // CRITICAL: Select password field
    const user = await userModel.findOne({ email }).select("+password");
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    res.cookie("saveInfo", token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.json({ 
      success: true, 
      message: "Login successful",
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      }
    });

  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
}));

// ✅ FIXED Logout - POST method + proper cookie clearing
router.post("/logout", (req, res) => {
  res.clearCookie("saveInfo", { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "lax",
    path: '/' // Ensure cookie is cleared from root path
  });
  res.json({ success: true, message: "Logged out successfully" });
});

// ✅ Signup
router.post("/signup", asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User already exists" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await userModel.create({ 
      username, 
      email, 
      password: hashedPassword 
    });

    res.status(201).json({ 
      success: true, 
      message: "Account created. Please login.",
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Signup failed" });
  }
}));

router.post("/forget-password", forgetPassword);
router.post("/reset-password", verifyPassword);

module.exports = router;