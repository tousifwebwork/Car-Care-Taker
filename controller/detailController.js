const carinfo = require("../models/carinfo");

// GET Detail page
exports.detailGet = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");

    const carId = req.params.id;
    const userId = req.session.user._id; // <- use _id

    const car = await carinfo.findOne({ _id: carId, userId });

    if (!car) return res.status(404).send("Car not found for this user");

    res.render("detail", {
      car,
      activePage: "detail",
      pageTitle: "Car Details",
      isLoggedIn: true,
      query: req.query,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching car details");
  }
};

// POST Detail page
exports.detailPost = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");

    const carId = req.params.id;
    const userId = req.session.user._id; // <- use _id
    const { Username, car_no, lastPUC, lastInsurance, phonenumber } = req.body;

    const nextPUC = new Date(lastPUC);
    nextPUC.setMonth(nextPUC.getMonth() + 6);

    const nextInsurance = new Date(lastInsurance);
    nextInsurance.setFullYear(nextInsurance.getFullYear() + 1);

    const updated = await carinfo.findOneAndUpdate(
      { _id: carId, userId },
      {
        Username,
        car_no,
        lastPUC: new Date(lastPUC),
        lastInsurance: new Date(lastInsurance),
        nextPUC,
        nextInsurance,
        phonenumber: Number(phonenumber),
      },
      { new: true }
    );

    if (!updated) return res.status(404).send("Car not found or not yours");

    res.redirect("/detail/" + carId);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating car details");
  }
};
