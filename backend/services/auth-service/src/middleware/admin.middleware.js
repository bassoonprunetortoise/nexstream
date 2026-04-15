const adminMiddleware = (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only ❌" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error ❌" });
  }
};

module.exports = adminMiddleware;