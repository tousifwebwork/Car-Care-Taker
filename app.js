/**
 * Car Management System
 * A comprehensive vehicle insurance and PUC reminder application
 * Author: Mohammad Tousif
 */

require("dotenv").config();

// Core Dependencies
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const MongoDBStore = require("connect-mongodb-session")(session);

// Configuration
const DB_PATH = process.env.MONGODB_URI;

// Route Imports
const addRoutes = require("./routes/addRouter");
const mainRoutes = require("./routes/mainRouter");
const detailRoutes = require("./routes/detailRouter");
const aboutmeRoutes = require("./routes/AboutmeRouter");
const myprojectRoutes = require("./routes/myprojectRouter");
const loginRouter = require("./routes/loginRouter");
const registerRouter = require("./routes/registerRouter");
const termsRouter = require("./routes/termsConditionRouter");
const profileRouter = require("./routes/profileRouter");
const editRoutes = require("./routes/editRoutes");
const editCarRoutes = require("./routes/editCarRouter");
const reminderRoutes = require("./routes/reminderRouter");
const forgotPasswordRoutes = require("./routes/forgotPasswordRouter");

// Services
const reminderService = require("./services/reminderService");

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

const store = new MongoDBStore({
  uri: DB_PATH,
  collection: "sessions",
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    isLoggedIn: false,
  })
);

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  next();
});

mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("✅ Database connected successfully");

    // Start the email reminder service after database connection
    setTimeout(() => {
      try {
        reminderService.start();
        console.log("📧 Email reminder service initialized");
      } catch (error) {
        console.error("Failed to start reminder service:", error);
      }
    }, 2000); // Wait 2 seconds to ensure database is fully connected
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

app.use("/login", loginRouter);
app.use("/add", addRoutes);
app.use("/detail", detailRoutes);
app.use("/aboutme", aboutmeRoutes);
app.use("/myproject", myprojectRoutes);
app.use("/main", mainRoutes);
app.use("/termsCondition", termsRouter);
app.use("/register", registerRouter);
app.use("/profile", profileRouter);
app.use("/editprofile", editRoutes);
app.use("/editcar", editCarRoutes);
app.use("/reminders", reminderRoutes);
app.use("/", forgotPasswordRoutes);

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    } else {
      res.redirect("/login");
    }
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Car Management System Started!`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
  console.log(
    `📧 Email reminders: ${
      process.env.EMAIL_ENABLED === "true" ? "Enabled" : "Disabled"
    }`
  );
});
