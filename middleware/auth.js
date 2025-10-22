// middleware/auth.js
const jwt = require("jsonwebtoken");
const userModel = require("../models/user_model.js");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

// ✅ Fixed redirectIfAuthenticated with proper error handling
const redirectIfAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.saveInfo;
    
    if (!token) {
      return next(); // No token = allow login
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists in DB
    const user = await userModel.findById(decoded.userId).select("-password");
    
    if (!user) {
      res.clearCookie("saveInfo", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax"
      });
      return next();
    }

    req.userId = decoded.userId;
    req.user = user;

    // For login/signup routes, return already authenticated
    if (req.path.includes('login') || req.path.includes('signup')) {
      return res.status(200).json({
        success: true,
        loggedIn: true,
        userId: decoded.userId,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    }

    next();
  } catch (err) {
    // Clear invalid token
    res.clearCookie("saveInfo", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax"
    });
    return next(); // Allow login with invalid token
  }
};

// ✅ Protect middleware for protected routes
const protect = async (req, res, next) => {
  try {
    const token = req.cookies.saveInfo;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, access denied"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

// Existing forgetPassword and verifyPassword functions
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Please provide an email" });

    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "Email not registered" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.MY_GMAIL_NAME,
        pass: process.env.APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MY_GMAIL_NAME,
      to: email,
      subject: "Reset Password",
      html: `
        <p>Use this code to reset your password:</p>
        <p><strong>${token}</strong></p>
        <p style="color:red">Do not share this token.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Reset code sent" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const verifyPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: "Token and password required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const hashedPassword = await bcrypt.hash(password, 8);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  redirectIfAuthenticated,
  protect,
  forgetPassword,
  verifyPassword
};