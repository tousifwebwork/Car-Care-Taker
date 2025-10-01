const mongoose = require("mongoose");

const editSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Login",
      required: true,
    },
    fullName: { type: String, required: false }, // Normal/Display name (separate from login username)
    email: String,
    phonenumber: String,
    address: String,
    gender: String,
    dob: Date,
    image: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("EditProfile", editSchema);
