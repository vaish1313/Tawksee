const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Mongo DB connected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
