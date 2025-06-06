const mongoose = require("mongoose");
const config = require("config");
require("dotenv").config();

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

module.exports = mongoose.connection;
