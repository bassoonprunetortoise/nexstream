require("dotenv").config(); // ✅ ye sabse upar

const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth.routes");

const app = express();
app.use(express.json());

// MongoDB connect
mongoose
  .connect("mongodb://localhost:27017/nexstream")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

// routes
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Auth Service Running 🚀");
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});