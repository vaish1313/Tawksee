const Otp = require("../models/Otp");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmails");
const { sendSMS } = require("../utils/sendSMS");

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

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
  const { contact, otp } = req.body;

  try {
    const existing = await Otp.findOne({ contact, otp });

    if (!existing) {
      console.warn("⚠️ Invalid or expired OTP");
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    let user = await User.findOne({ contact });

    if (!user) {
      user = await User.create({ contact });
    }

    await Otp.deleteMany({ contact });

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ error: "Server config error (JWT_SECRET missing)" });
    }

    const token = jwt.sign({ id: user._id, contact }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: "OTP verification failed" });
  }
};

module.exports = { requestOtp, verifyOtp };
