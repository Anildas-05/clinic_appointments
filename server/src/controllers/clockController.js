const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");

const runClock = async (req, res) => {
  try {
    const now = req.body.now ? new Date(req.body.now) : new Date();

    if (Number.isNaN(now.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date provided",
      });
    }

    // Mark appointments as NO_SHOW 30 minutes after their start time.
    const noShowCutoff = new Date(now.getTime() - 30 * 60 * 1000);

    const noShowResult = await Appointment.updateMany(
      {
        status: { $in: ["BOOKED", "CONFIRMED"] },
        startTime: { $lte: noShowCutoff },
      },
      {
        $set: { status: "NO_SHOW" },
      }
    );

    // Find today's appointments for reminder notifications.
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const appointments = await Appointment.find({
      startTime: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ["BOOKED", "CONFIRMED"] },
    }).populate("patient", "name");

    let remindersCreated = 0;

    for (const appointment of appointments) {
      const dedupeKey = `REMINDER-${appointment._id}-${startOfDay.toISOString().slice(0, 10)}`;

      const existingNotification = await Notification.findOne({
        dedupeKey,
      });

      if (!existingNotification) {
        await Notification.create({
          appointment: appointment._id,
          patient: appointment.patient._id,
          type: "APPOINTMENT_REMINDER",
          message: `Reminder: You have an appointment today at ${appointment.startTime.toISOString()}`,
          dedupeKey,
          status: "PENDING",
        });

        remindersCreated++;
      }
    }

    res.status(200).json({
      success: true,
      message: "Clock automation executed",
      currentTime: now,
      noShowsMarked: noShowResult.modifiedCount,
      remindersCreated,
    });
  } catch (error) {
    console.error("Clock automation error:", error);

    res.status(500).json({
      success: false,
      message: "Clock automation failed",
    });
  }
};

const getOutbox = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("patient", "name phone email")
      .populate("appointment")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch outbox",
    });
  }
};

module.exports = {
  runClock,
  getOutbox,
};
