const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const Message = require("../models/Message");

// Create Chat
router.post("/create", async (req, res) => {
  try {
    const { participants, type, name } = req.body;

    if (!participants || participants.length < 2) {
      return res.status(400).json({ message: "At least two users required" });
    }

    const chat = await Chat.create({
      participants,
      type,
      name: type === "group" ? name : undefined,
    });

    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get User's Chats
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({ participants: userId })
      .populate("participants", "_id name avatar")
      .populate("lastMessage");

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Send Message
router.post("/:chatId/message", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { senderId, content, type } = req.body;

    const message = await Message.create({
      chatId,
      senderId,
      content,
      type,
    });

    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
