const Otp = require("../models/Otp");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmails");
const { sendSMS } = require("../utils/sendSMS");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const requestOtp = async (req, res) => {
  const { contact } = req.body;
  const otp = generateOtp();

  try {
    await Otp.deleteMany({ contact }); // clear old OTPs
    await new Otp({ contact, otp }).save();

    if (contact.includes("@")) {
      await sendEmail(contact, otp);
    } else {
      try {
        await sendSMS(contact, otp);
      } catch (smsErr) {
        console.error("Twilio SMS Error:", smsErr.message);
        return res.status(500).json({ error: "Failed to send SMS OTP" });
      }
    }

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  const { contact, otp, name, username } = req.body;

  try {
    const existing = await Otp.findOne({ contact, otp });
    if (!existing) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    let user = await User.findOne({ contact });
    if (!user) {
      if (!name || !username) {
        return res.status(400).json({ error: "Name and username are required for signup" });
      }
      // Check if username is unique (case-insensitive)
      const usernameExists = await User.findOne({ username: username.toLowerCase() });
      if (usernameExists) {
        return res.status(400).json({ error: "Username already exists" });
      }
      user = await User.create({
        contact,
        name,
        username: username.toLowerCase(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
      });
    }

    await Otp.deleteMany({ contact });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Server config error (JWT_SECRET missing)" });
    }

    const token = jwt.sign({ id: user._id, contact, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: "OTP verification failed" });
  }
};

const loginUser = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Server config error (JWT_SECRET missing)" });
    }

    const token = jwt.sign({ id: user._id, contact: user.contact, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

module.exports = { requestOtp, verifyOtp, loginUser };
