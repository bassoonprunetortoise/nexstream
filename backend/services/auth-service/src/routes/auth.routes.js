const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware"); // 🔥 NEW
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user-auth.model");

const router = express.Router();

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.json({ message: "Email & Password required ❌" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ message: "User already exists ❌" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || "user", // 🔥 role support
    });

    res.json({
      message: "User Registered ✅",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ message: error.message });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not found ❌" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ message: "Wrong password ❌" });
    }

    // 🔥 ACCESS TOKEN (role added)
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // 🔥 REFRESH TOKEN
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: "Login successful ✅",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ message: error.message });
  }
});

// ================= REFRESH =================
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.json({ message: "No refresh token ❌" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.json({ message: "Invalid refresh token ❌" });
    }

    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.log(error);
    res.json({ message: "Refresh failed ❌" });
  }
});

// ================= LOGOUT =================
router.post("/logout", async (req, res) => {
  try {
    const { userId } = req.body;

    await User.findByIdAndUpdate(userId, {
      refreshToken: null,
    });

    res.json({ message: "Logout successful ✅" });
  } catch (error) {
    console.log(error);
    res.json({ message: "Logout error ❌" });
  }
});

// ================= PROFILE =================
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    res.json({
      message: "Profile data ✅",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ message: error.message });
  }
});

// ================= ADMIN ONLY =================
router.get("/admin", authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    message: "Welcome Admin 👑",
  });
});

// ✅ ALWAYS LAST
module.exports = router;