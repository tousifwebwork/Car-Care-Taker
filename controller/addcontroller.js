const multer = require("multer");
const path = require("path");
const carinfo = require("../models/carinfo");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });
exports.upload = upload.single("image");

// GET Add Car page
exports.addget = async (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("add", { activePage: "add", pageTitle: "Add Car" });
};

// POST Add Car
exports.addpost = async (req, res) => {
  try {
    if (!req.session.user) {
      console.log("User not authenticated - redirecting to login");
      return res.redirect("/login");
    }

    console.log("Session user:", req.session.user._id);
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    const { Username, car_no, lastPUC, lastInsurance } = req.body;

    // Validate required fields
    if (!Username || !car_no || !lastPUC || !lastInsurance) {
      console.log("Validation failed - missing required fields");
      console.log("Username:", Username);
      console.log("car_no:", car_no);
      console.log("lastPUC:", lastPUC);
      console.log("lastInsurance:", lastInsurance);
      return res.render("add", {
        activePage: "add",
        pageTitle: "Add Car",
        error:
          "All fields (Username, Car Number, Last PUC, Last Insurance) are required",
        oldInput: req.body,
      });
    }

    // Validate date formats
    if (isNaN(Date.parse(lastPUC))) {
      console.log("Invalid PUC date:", lastPUC);
      return res.render("add", {
        activePage: "add",
        pageTitle: "Add Car",
        error: "Invalid PUC date format",
        oldInput: req.body,
      });
    }

    if (isNaN(Date.parse(lastInsurance))) {
      console.log("Invalid Insurance date:", lastInsurance);
      return res.render("add", {
        activePage: "add",
        pageTitle: "Add Car",
        error: "Invalid Insurance date format",
        oldInput: req.body,
      });
    }

    const nextPUC = new Date(lastPUC);
    nextPUC.setMonth(nextPUC.getMonth() + 6);

    const nextInsurance = new Date(lastInsurance);
    nextInsurance.setFullYear(nextInsurance.getFullYear() + 1);

    const image = req.file ? "/uploads/" + req.file.filename : null;

    // Ensure userId is properly converted to ObjectId
    const mongoose = require("mongoose");
    const userId = new mongoose.Types.ObjectId(req.session.user._id);

    const carData = {
      Username,
      car_no,
      lastPUC: new Date(lastPUC),
      lastInsurance: new Date(lastInsurance),
      nextPUC,
      nextInsurance,
      image,
      userId: userId,
    };

    console.log("Car data to save:", carData);
    console.log("Next PUC:", nextPUC);
    console.log("Next Insurance:", nextInsurance);

    const car = new carinfo(carData);
    await car.save();

    console.log("Car saved successfully");
    res.redirect("/main");
  } catch (err) {
    console.error("Detailed error in addpost:", err);

    // Check for specific MongoDB errors
    if (err.name === "ValidationError") {
      const errorMessages = Object.values(err.errors).map((e) => e.message);
      return res.render("add", {
        activePage: "add",
        pageTitle: "Add Car",
        error: `Validation Error: ${errorMessages.join(", ")}`,
        oldInput: req.body,
      });
    }

    if (err.code === 11000) {
      return res.render("add", {
        activePage: "add",
        pageTitle: "Add Car",
        error: "Car number already exists. Please use a different car number.",
        oldInput: req.body,
      });
    }

    res.render("add", {
      activePage: "add",
      pageTitle: "Add Car",
      error: `Error storing data: ${err.message}`,
      oldInput: req.body,
    });
  }
};
