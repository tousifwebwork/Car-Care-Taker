const EditProfile = require("../models/editModel");
const Car = require("../models/carinfo");
const Login = require("../models/login");
exports.profileget = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");

    // Fetch updated profile from EditProfile
    const profile = await EditProfile.findOne({ userId: req.session.user._id });

    // Always fetch login data to get the email and other core info
    const loginData = await Login.findById(req.session.user._id);

    // Merge profile data with login data, prioritizing profile for updated fields
    const combinedData = {
      ...loginData.toObject(),
      ...(profile ? profile.toObject() : {}),
    };

    // Fetch cars for this user
    const cars = await Car.find({ userId: req.session.user._id });

    res.render("profile", {
      logininfo: combinedData,
      carinfo: cars,
      pageTitle: "Profile",
      activePage: "profile",
    });
  } catch (err) {
    console.error(err);
    res.send("Error loading profile");
  }
};
