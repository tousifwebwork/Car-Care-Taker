const Login = require("../models/login");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

// Validation rules for registration
exports.registerValidation = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters")
    .isAlphanumeric()
    .withMessage("Username can only contain letters and numbers")
    .trim(),
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

exports.getRegister = (req, res) => {
  res.render("register", {
    pageTitle: "Register",
    isLoggedIn: req.session.isLoggedIn || false,
    activePage: "register",
    errors: [],
    oldInput: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });
};

exports.postRegister = async (req, res) => {
  try {
    const { username, password, confirmPassword, email } = req.body;
    const termsAccepted = req.body.terms ? true : false; // checkbox value

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("register", {
        pageTitle: "Register",
        isLoggedIn: req.session.isLoggedIn || false,
        activePage: "register",
        errors: errors.array(),
        oldInput: {
          username: username,
          email: email,
          password: password,
          confirmPassword: confirmPassword,
          termsAccepted: termsAccepted,
        },
      });
    }

    // Check if user already exists
    const existingUser = await Login.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (existingUser) {
      const errorMessage =
        existingUser.username === username
          ? "Username already exists"
          : "Email already registered";

      return res.render("register", {
        pageTitle: "Register",
        isLoggedIn: req.session.isLoggedIn || false,
        activePage: "register",
        errors: [{ msg: errorMessage }],
        oldInput: {
          username: username,
          email: email,
          password: password,
          confirmPassword: confirmPassword,
          termsAccepted: termsAccepted,
        },
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new Login({
      username: username,
      email: email,
      password: hashedPassword,
    });

    await newUser.save();

    // Automatically log in after registration
    req.session.user = newUser;
    req.session.isLoggedIn = true;

    req.session.save((err) => {
      if (err) console.error(err);
      res.redirect("/main");
    });
  } catch (err) {
    console.error(err);
    res.render("register", {
      pageTitle: "Register",
      isLoggedIn: req.session.isLoggedIn || false,
      activePage: "register",
      errors: [{ msg: "Server error during registration. Please try again." }],
      oldInput: {
        username: req.body.username || "",
        email: req.body.email || "",
        password: req.body.password || "",
        confirmPassword: req.body.confirmPassword || "",
        termsAccepted: req.body.terms ? true : false,
      },
    });
  }
};
