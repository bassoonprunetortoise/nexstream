require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth.routes");

const app = express();
app.use(express.json());

// ✅ MongoDB Atlas connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

// routes
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Auth Service Running 🚀");
});

// ✅ Render port fix
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});