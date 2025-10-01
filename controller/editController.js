const EditProfile = require("../models/editModel");
const Login = require("../models/login");
const multer = require("multer");
const path = require("path");

// ---------------- Multer Setup ----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Export middleware
exports.uploadProfileImage = upload.single("profileImage");

// ---------------- GET Edit Profile ----------------
exports.getEditProfile = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");

    // Get login data first (contains the signup email)
    const loginData = await Login.findById(req.session.user._id);

    // Check if profile exists
    let profile = await EditProfile.findOne({ userId: req.session.user._id });

    if (!profile) {
      // If not exists, create a blank profile
      profile = new EditProfile({ userId: req.session.user._id });
      await profile.save();
    }

    // Merge login data with profile data, prioritizing profile for updated fields
    const combinedData = {
      ...loginData.toObject(),
      ...(profile ? profile.toObject() : {}),
    };

    res.render("editprofile", {
      logininfo: combinedData,
      pageTitle: "Edit Profile",
      activePage: "profile",
    });
  } catch (err) {
    console.error(err);
    res.send("Error loading edit form");
  }
};

// ---------------- POST Edit Profile ----------------
exports.postEditProfile = async (req, res) => {
  try {
    const { fullName, email, address, gender, dob, removeImage } = req.body;

    let updateData = { fullName, email, address, gender, dob };

    // Handle image logic
    if (removeImage === "1") {
      // User wants to remove the image
      updateData.image = null;
    } else if (req.file) {
      // User uploaded a new image
      updateData.image = "/uploads/" + req.file.filename;
    }
    // If removeImage is "0" and no new file, keep existing image (don't update image field)

    // Update profile
    await EditProfile.findOneAndUpdate(
      { userId: req.session.user._id },
      updateData,
      { new: true, upsert: true } // create if not exists
    );

    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    res.send("Error updating profile");
  }
};
