const express = require("express");
const { requestOtp, verifyOtp, loginUser } = require("../controllers/authController");
const router = express.Router();

// Request OTP (signup)
router.post("/request-otp", requestOtp);
// Verify OTP (signup, requires name and username)
router.post("/verify-otp", verifyOtp);
// Login with username
router.post("/login", loginUser);

module.exports = router;
