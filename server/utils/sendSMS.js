const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const sendSMS = async (to, otp) => {
  await client.messages.create({
    body: `Your OTP is: ${otp}`,
    from: twilioPhone,
    to: to.startsWith("+") ? to : `+91${to}`, // Auto-fix for Indian numbers
  });
};

module.exports = { sendSMS };
