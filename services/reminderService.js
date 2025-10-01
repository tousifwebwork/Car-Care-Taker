const cron = require("node-cron");
const Car = require("../models/carinfo");
const Login = require("../models/login");
const EditProfile = require("../models/editModel");
const EmailLog = require("../models/emailLog");
const emailService = require("./emailService");

class ReminderService {
  constructor() {
    this.reminderDays = [3, 2, 1, 0];
    this.isRunning = false;
  }

  // Start the reminder service
  start() {
    if (this.isRunning) {
      return;
    }

    // Check if email is enabled
    if (process.env.EMAIL_ENABLED !== "true") {
      console.log("📧 Email reminders are disabled");
      return;
    }

    // Schedule to run at 6:20 PM for testing
    this.cronJob = cron.schedule(
      "2 19 * * *",
      async () => {
        await this.checkAndSendReminders();
      },
      {
        scheduled: false,
        timezone: "Asia/Kolkata",
      }
    );

    this.cronJob.start();
    this.isRunning = true;
    console.log("✅ Email reminder service started");

    // Also run immediately for testing (optional - remove in production)
    setTimeout(() => this.checkAndSendReminders(), 5000);
  }

  // Stop the reminder service
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isRunning = false;
      console.log("🛑 Email reminder service stopped");
    }
  }

  // Check and send reminders
  async checkAndSendReminders() {
    try {
      // Check if email is enabled
      if (process.env.EMAIL_ENABLED !== "true") {
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

      // Get all cars with their user information
      const cars = await Car.find({})
        .populate("userId", "username email")
        .lean();

      let totalReminders = 0;

      for (const car of cars) {
        if (!car.userId) continue;

        // Get user's email from EditProfile or fallback to Login
        let userEmail = null;
        let userName = car.userId.username || "User";

        // Try to get email from EditProfile first
        const profile = await EditProfile.findOne({
          userId: car.userId._id,
        }).lean();
        if (profile && profile.email) {
          userEmail = profile.email;
          userName = profile.username || userName;
        } else if (car.userId.email) {
          userEmail = car.userId.email;
        }

        if (!userEmail) {
          continue;
        }

        // Check insurance expiry
        if (car.nextInsurance) {
          await this.checkExpiryAndSendReminder({
            car,
            userEmail,
            userName,
            expiryDate: car.nextInsurance,
            reminderType: "insurance",
            today,
          });
          totalReminders++;
        }

        // Check PUC expiry
        if (car.nextPUC) {
          await this.checkExpiryAndSendReminder({
            car,
            userEmail,
            userName,
            expiryDate: car.nextPUC,
            reminderType: "puc",
            today,
          });
          totalReminders++;
        }
      }
    } catch (error) {
      console.error("❌ Error in reminder service:", error);
    }
  }

  // Check specific expiry and send reminder if needed
  async checkExpiryAndSendReminder(data) {
    const { car, userEmail, userName, expiryDate, reminderType, today } = data;

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry - today;
    const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    console.log(
      `🔍 Checking ${reminderType} for ${car.car_no}: ${daysUntilExpiry} days until expiry`
    );

    // Check if we need to send a reminder for this number of days
    if (this.reminderDays.includes(daysUntilExpiry)) {
      const alreadySent = await this.checkIfReminderSent({
        userId: car.userId._id,
        carId: car._id,
        reminderType,
        daysBeforeExpiry: daysUntilExpiry,
        expiryDate: expiry,
      });

      if (!alreadySent) {
        await this.sendReminderEmail({
          userId: car.userId._id,
          carId: car._id,
          email: userEmail,
          userName,
          carNumber: car.car_no,
          expiryDate: expiry,
          daysRemaining: daysUntilExpiry,
          reminderType,
        });
      }
    }
  }

  // Check if reminder was already sent
  async checkIfReminderSent(data) {
    const { userId, carId, reminderType, daysBeforeExpiry, expiryDate } = data;

    // Create a normalized date (start of day) for comparison
    const normalizedExpiryDate = new Date(expiryDate);
    normalizedExpiryDate.setHours(0, 0, 0, 0);

    const existingLog = await EmailLog.findOne({
      userId,
      carId,
      reminderType,
      daysBeforeExpiry,
      expiryDate: normalizedExpiryDate,
    });

    return !!existingLog;
  }

  // Send reminder email and log it
  async sendReminderEmail(data) {
    const {
      userId,
      carId,
      email,
      userName,
      carNumber,
      expiryDate,
      daysRemaining,
      reminderType,
    } = data;

    try {
      const emailResult = await emailService.sendReminderEmail({
        email,
        userName,
        carNumber,
        expiryDate,
        daysRemaining,
        reminderType,
      });

      // Create a normalized date (start of day) for logging
      const normalizedExpiryDate = new Date(expiryDate);
      normalizedExpiryDate.setHours(0, 0, 0, 0);

      // Log the email
      const emailLog = new EmailLog({
        userId,
        carId,
        email,
        reminderType,
        daysBeforeExpiry: daysRemaining,
        expiryDate: normalizedExpiryDate,
        status: emailResult.success ? "sent" : "failed",
      });

      await emailLog.save();
    } catch (error) {
      console.error(
        `❌ Error sending ${reminderType} reminder to ${email}:`,
        error
      );
    }
  }

  // Manual trigger for testing
  async triggerManualCheck() {
    await this.checkAndSendReminders();
  }

  // Get reminder statistics
  async getStats() {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const todayStats = await EmailLog.aggregate([
        {
          $match: {
            sentAt: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $group: {
            _id: {
              reminderType: "$reminderType",
              status: "$status",
            },
            count: { $sum: 1 },
          },
        },
      ]);

      const totalStats = await EmailLog.aggregate([
        {
          $group: {
            _id: {
              reminderType: "$reminderType",
              status: "$status",
            },
            count: { $sum: 1 },
          },
        },
      ]);

      return {
        today: todayStats,
        total: totalStats,
      };
    } catch (error) {
      console.error("Error getting reminder stats:", error);
      return { today: [], total: [] };
    }
  }
}

module.exports = new ReminderService();
