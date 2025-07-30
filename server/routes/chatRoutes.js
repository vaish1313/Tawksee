const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Search users
router.get("/search/users", async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id; // Get from auth middleware

    if (!query || query.length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: query, $options: "i" } },
            { name: { $regex: query, $options: "i" } }
          ]
        },
        { _id: { $ne: userId } } // Exclude current user
      ]
    }).select("_id username name avatar status statusEmoji isOnline lastSeen");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

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
    const currentUserId = req.user.id;

    // Ensure user can only access their own chats
    if (userId !== currentUserId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const chats = await Chat.find({ participants: userId })
      .populate("participants", "_id username name avatar")
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
    const currentUserId = req.user.id;

    // Ensure user can only send messages as themselves
    if (senderId !== currentUserId) {
      return res.status(403).json({ message: "Access denied" });
    }

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
