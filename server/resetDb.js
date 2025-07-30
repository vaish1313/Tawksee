require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const resetDatabase = async () => {
  try {
    await connectDB();
    
    // Drop all collections
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.drop();
    }
    
    console.log("✅ Database reset successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  }
};

resetDatabase(); 