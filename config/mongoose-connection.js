const mongoose = require("mongoose");
const config = require("config");

mongoose.connect(config.get("MONGODB_URI"))
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

module.exports = mongoose.connection;
