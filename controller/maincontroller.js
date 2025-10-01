const carinfo = require("../models/carinfo");
const EditProfile = require("../models/editModel");
const Login = require("../models/login");

exports.mainget = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const cars = await carinfo.find({ userId: req.session.user._id });
    const loggedIn = req.session.isLoggedIn ? true : false;
    res.render("main", {
      cars,
      activePage: "main",
      pageTitle: "Main Page",
      isLoggedIn: loggedIn,
    });
  } catch (err) {
    console.error(err);
    res.send("Error fetching data");
  }
};

exports.dashboardget = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const cars = await carinfo.find({ userId: req.session.user._id });

    // Get user profile info
    let profile = await EditProfile.findOne({ userId: req.session.user._id });

    // Always fetch login data to get the email and other core info
    const loginData = await Login.findById(req.session.user._id);

    // Merge profile data with login data, prioritizing profile for updated fields
    const combinedData = {
      ...loginData.toObject(),
      ...(profile ? profile.toObject() : {}),
    };

    const loggedIn = req.session.isLoggedIn ? true : false;
    res.render("dashboard", {
      carinfo: cars,
      logininfo: combinedData,
      activePage: "dashboard",
      pageTitle: "Dashboard",
      isLoggedIn: loggedIn,
    });
  } catch (err) {
    console.error(err);
    res.send("Error fetching data");
  }
};
