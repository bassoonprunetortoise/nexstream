const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  refreshToken: {
    type: String,
    default: null,
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  }, // 🔥 NEW FIELD
});

module.exports = mongoose.model("User", userSchema);