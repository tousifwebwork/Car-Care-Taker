const express = require("express");
const router = express.Router();
const forgotPasswordController = require("../controller/forgotPasswordController");

// GET forgot password page
router.get("/forgot-password", forgotPasswordController.getForgotPassword);

// POST forgot password - send OTP
router.post("/forgot-password", forgotPasswordController.postForgotPassword);

// POST reset password with OTP
router.post("/reset-password", forgotPasswordController.postResetPassword);

module.exports = router;
