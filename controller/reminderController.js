const reminderService = require("../services/reminderService");
const EmailLog = require("../models/emailLog");
const Car = require("../models/carinfo");

// Get reminder dashboard
exports.getReminderDashboard = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");

    // Get reminder statistics
    const stats = await reminderService.getStats();

    // Get recent email logs for current user's cars
    const userCars = await Car.find({ userId: req.session.user._id }).select(
      "_id"
    );
    const carIds = userCars.map((car) => car._id);

    const recentLogs = await EmailLog.find({ carId: { $in: carIds } })
      .populate("carId", "car_no Username")
      .sort({ sentAt: -1 })
      .limit(10);

    // Get upcoming expirations for user's cars
    const today = new Date();
    const thirtyDaysFromNow = new Date(
      today.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const upcomingExpirations = await Car.find({
      userId: req.session.user._id,
      $or: [
        { nextInsurance: { $gte: today, $lte: thirtyDaysFromNow } },
        { nextPUC: { $gte: today, $lte: thirtyDaysFromNow } },
      ],
    });

    res.render("reminderDashboard", {
      pageTitle: "Email Reminders",
      activePage: "reminders",
      stats,
      recentLogs,
      upcomingExpirations,
      isServiceRunning: reminderService.isRunning,
    });
  } catch (error) {
    console.error("Error loading reminder dashboard:", error);
    res.send("Error loading reminder dashboard");
  }
};

// Trigger manual reminder check (admin only)
exports.triggerManualCheck = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await reminderService.triggerManualCheck();

    res.json({
      success: true,
      message: "Manual reminder check completed successfully",
    });
  } catch (error) {
    console.error("Error triggering manual check:", error);
    res.status(500).json({
      success: false,
      message: "Error triggering manual check",
    });
  }
};

// Get reminder statistics API
exports.getStats = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const stats = await reminderService.getStats();

    res.json({
      success: true,
      stats,
      isServiceRunning: reminderService.isRunning,
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({
      success: false,
      message: "Error getting statistics",
    });
  }
};
