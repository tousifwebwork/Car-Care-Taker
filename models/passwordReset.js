const mongoose = require("mongoose");

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900, // OTP expires after 15 minutes (900 seconds)
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("PasswordReset", passwordResetSchema);
