const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  contact: { type: String, unique: true, required: true }, // email or phone
  name: { type: String, required: true },
  avatar: { type: String },
  status: { type: String, default: "Hey there! I'm using Tawksee." },
  statusEmoji: { type: String, default: "💬" },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date },
});

module.exports = mongoose.model("User", userSchema);
