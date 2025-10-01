const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const Login = require("../models/login");
const PasswordReset = require("../models/passwordReset");
const emailService = require("../services/emailService");

// GET forgot password page
exports.getForgotPassword = (req, res) => {
  res.render("forgotPassword", {
    pageTitle: "Forgot Password",
    activePage: "login",
    errors: [],
    message: null,
    oldInput: {},
    showOtpForm: false,
  });
};

// POST forgot password - send OTP
exports.postForgotPassword = [
  // Validation
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  async (req, res) => {
    const errors = validationResult(req);
    const { email } = req.body;

    if (!errors.isEmpty()) {
      return res.render("forgotPassword", {
        pageTitle: "Forgot Password",
        activePage: "login",
        errors: errors.array(),
        message: null,
        oldInput: { email },
        showOtpForm: false,
      });
    }

    try {
      // Check if user exists
      const user = await Login.findOne({ email });
      if (!user) {
        return res.render("forgotPassword", {
          pageTitle: "Forgot Password",
          activePage: "login",
          errors: [{ msg: "No account found with this email address" }],
          message: null,
          oldInput: { email },
          showOtpForm: false,
        });
      }

      // Generate OTP
      const otp = emailService.generateOTP();

      // Save OTP to database (delete any existing OTP for this email first)
      await PasswordReset.deleteMany({ email });
      const passwordReset = new PasswordReset({
        email,
        otp,
      });
      await passwordReset.save();

      // Send OTP email
      const emailResult = await emailService.sendPasswordResetOTP(email, otp);

      if (emailResult.success) {
        return res.render("forgotPassword", {
          pageTitle: "Forgot Password",
          activePage: "login",
          errors: [],
          message:
            "OTP sent successfully! Check your email and enter the 7-character code below.",
          oldInput: { email },
          showOtpForm: true,
        });
      } else {
        return res.render("forgotPassword", {
          pageTitle: "Forgot Password",
          activePage: "login",
          errors: [{ msg: "Failed to send email. Please try again." }],
          message: null,
          oldInput: { email },
          showOtpForm: false,
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.render("forgotPassword", {
        pageTitle: "Forgot Password",
        activePage: "login",
        errors: [{ msg: "Something went wrong. Please try again." }],
        message: null,
        oldInput: { email },
        showOtpForm: false,
      });
    }
  },
];

// POST verify OTP and reset password
exports.postResetPassword = [
  // Validation
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("otp")
    .isLength({ min: 7, max: 7 })
    .withMessage("OTP must be exactly 7 characters")
    .matches(/^[A-Z0-9]+$/)
    .withMessage("OTP must contain only uppercase letters and numbers"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),

  async (req, res) => {
    const errors = validationResult(req);
    const { email, otp, newPassword } = req.body;

    if (!errors.isEmpty()) {
      return res.render("forgotPassword", {
        pageTitle: "Forgot Password",
        activePage: "login",
        errors: errors.array(),
        message: null,
        oldInput: { email },
        showOtpForm: true,
      });
    }

    try {
      // Find valid OTP
      const passwordReset = await PasswordReset.findOne({
        email,
        otp: otp.toUpperCase(),
        isUsed: false,
      });

      if (!passwordReset) {
        return res.render("forgotPassword", {
          pageTitle: "Forgot Password",
          activePage: "login",
          errors: [{ msg: "Invalid or expired OTP. Please try again." }],
          message: null,
          oldInput: { email },
          showOtpForm: true,
        });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update user password
      await Login.findOneAndUpdate({ email }, { password: hashedPassword });

      // Mark OTP as used
      passwordReset.isUsed = true;
      await passwordReset.save();

      // Redirect to login with success message
      req.session.successMessage =
        "Password reset successfully! You can now login with your new password.";
      return res.redirect("/login");
    } catch (error) {
      console.error("Reset password error:", error);
      return res.render("forgotPassword", {
        pageTitle: "Forgot Password",
        activePage: "login",
        errors: [{ msg: "Something went wrong. Please try again." }],
        message: null,
        oldInput: { email },
        showOtpForm: true,
      });
    }
  },
];
