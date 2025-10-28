const carinfo = require("../models/carinfo");
const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});


exports.uploadCarImage = upload.single("carImage");

exports.getEditCar = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");

    const carId = req.params.id;
    const userId = req.session.user._id;

    const car = await carinfo.findOne({ _id: carId, userId });

    if (!car) {
      return res.status(404).send("Car not found for this user");
    }

    res.render("editcar", {
      car,
      activePage: "edit",
      pageTitle: "Edit Car Details",
      isLoggedIn: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading edit car page");
  }
};

// ---------------- POST Update Car Details ----------------
exports.postEditCar = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");

    const carId = req.params.id;
    const userId = req.session.user._id;
    const { Username, car_no, lastPUC, lastInsurance, phonenumber, email } =
      req.body;

    // Calculate next dates
    const nextPUC = new Date(lastPUC);
    nextPUC.setMonth(nextPUC.getMonth() + 6);

    const nextInsurance = new Date(lastInsurance);
    nextInsurance.setFullYear(nextInsurance.getFullYear() + 1);

    // Prepare update data
    const updateData = {
      Username,
      car_no,
      lastPUC: new Date(lastPUC),
      lastInsurance: new Date(lastInsurance),
      nextPUC,
      nextInsurance,
      phonenumber: Number(phonenumber),
      email: email || undefined,
    };

    // Add image if uploaded
    if (req.file) {
      updateData.image = "/uploads/" + req.file.filename;
    }

    // Update the car
    const updatedCar = await carinfo.findOneAndUpdate(
      { _id: carId, userId },
      updateData,
      { new: true }
    );

    if (!updatedCar) {
      return res.status(404).send("Car not found for this user");
    }

    // Redirect to car details page with success message
    res.redirect(`/detail/${carId}?updated=true`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating car details");
  }
};
