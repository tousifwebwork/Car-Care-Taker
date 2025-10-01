const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Login",
      required: true,
    },
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "abc",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    reminderType: {
      type: String,
      enum: ["insurance", "puc"],
      required: true,
    },
    daysBeforeExpiry: {
      type: Number,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to prevent duplicate emails
emailLogSchema.index(
  {
    userId: 1,
    carId: 1,
    reminderType: 1,
    daysBeforeExpiry: 1,
    expiryDate: 1,
  },
  { unique: true }
);

module.exports = mongoose.model("EmailLog", emailLogSchema);
