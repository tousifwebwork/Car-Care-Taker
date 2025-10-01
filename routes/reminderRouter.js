const express = require("express");
const router = express.Router();
const reminderController = require("../controller/reminderController");

// Reminder dashboard
router.get("/", reminderController.getReminderDashboard);

// Trigger manual reminder check
router.post("/trigger", reminderController.triggerManualCheck);

// Get reminder statistics
router.get("/stats", reminderController.getStats);

module.exports = router;
