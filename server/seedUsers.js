require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

const seedUsers = async () => {
  try {
    await connectDB();
    
    // Clear existing users
    await User.deleteMany({});
    
    // Create test users
    const testUsers = [
      {
        contact: "john.doe@example.com",
        username: "john_doe",
        name: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john_doe",
        status: "Hey there! I'm using Tawksee.",
        statusEmoji: "😊",
        isOnline: false
      },
      {
        contact: "jane.smith@example.com",
        username: "jane_smith",
        name: "Jane Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane_smith",
        status: "Living my best life! ✨",
        statusEmoji: "✨",
        isOnline: true
      },
      {
        contact: "alex.chen@example.com",
        username: "alex_chen",
        name: "Alex Chen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex_chen",
        status: "Coding wizard 🧙‍♂️",
        statusEmoji: "🚀",
        isOnline: false
      },
      {
        contact: "sarah.johnson@example.com",
        username: "sarah_johnson",
        name: "Sarah Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah_johnson",
        status: "Adventure awaits! 🏔️",
        statusEmoji: "🌟",
        isOnline: true
      },
      {
        contact: "mike.rodriguez@example.com",
        username: "mike_rodriguez",
        name: "Mike Rodriguez",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike_rodriguez",
        status: "Music is life 🎵",
        statusEmoji: "🎵",
        isOnline: false
      }
    ];
    
    await User.insertMany(testUsers);
    console.log("✅ Test users created successfully!");
    console.log("Users created:");
    testUsers.forEach(user => {
      console.log(`- ${user.name} (@${user.username}) - ${user.contact}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers(); 