const Login = require("../models/login");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

// Validation rules for login
exports.loginValidation = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .trim(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

exports.getLogin = (req, res) => {
  // Check for success message from password reset
  const successMessage = req.session.successMessage;
  req.session.successMessage = null; // Clear the message after reading

  res.render("login", {
    pageTitle: "Login",
    isLoggedIn: req.session.isLoggedIn || false,
    activePage: "login",
    errors: [],
    successMessage: successMessage,
    oldInput: {
      username: "",
      password: "",
      termsAccepted: false,
    },
  });
};

exports.postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const termsAccepted = req.body.terms ? true : false; // checkbox value

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("login", {
        pageTitle: "Login",
        isLoggedIn: req.session.isLoggedIn || false,
        activePage: "login",
        errors: errors.array(),
        successMessage: null,
        oldInput: {
          username: username,
          password: password,
          termsAccepted: termsAccepted,
        },
      });
    }

    const user = await Login.findOne({ username });
    if (!user) {
      return res.render("login", {
        pageTitle: "Login",
        isLoggedIn: req.session.isLoggedIn || false,
        activePage: "login",
        errors: [{ msg: "Invalid username or password" }],
        successMessage: null,
        oldInput: {
          username: username,
          password: password,
          termsAccepted: termsAccepted,
        },
      });
    }

    // Check password (assuming you're using bcrypt for hashed passwords)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.render("login", {
        pageTitle: "Login",
        isLoggedIn: req.session.isLoggedIn || false,
        activePage: "login",
        errors: [{ msg: "Invalid username or password" }],
        successMessage: null,
        oldInput: {
          username: username,
          password: password,
          termsAccepted: termsAccepted,
        },
      });
    }

    req.session.user = user; // store full user document
    req.session.isLoggedIn = true;

    req.session.save((err) => {
      if (err) console.error(err);
      res.redirect("/main/dashboard");
    });
  } catch (err) {
    console.error(err);
    res.render("login", {
      pageTitle: "Login",
      isLoggedIn: req.session.isLoggedIn || false,
      activePage: "login",
      errors: [{ msg: "Server error during login. Please try again." }],
      successMessage: null,
      oldInput: {
        username: req.body.username || "",
        password: req.body.password || "",
        termsAccepted: req.body.terms ? true : false,
      },
    });
  }
};
