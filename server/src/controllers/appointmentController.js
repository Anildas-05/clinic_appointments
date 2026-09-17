const Appointment = require("../models/Appointment");

const checkOverlap = async (doctor, startTime, endTime, excludeId = null) => {
  const query = {
    doctor,
    status: { $in: ["BOOKED", "CONFIRMED"] },
    startTime: { $lt: new Date(endTime) },
    endTime: { $gt: new Date(startTime) },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Appointment.findOne(query);
};

const createAppointment = async (req, res) => {
  try {
    const { doctor, patient, startTime, endTime } = req.body;

    if (!doctor || !patient || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Doctor, patient, start time and end time are required",
      });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    const conflict = await checkOverlap(doctor, startTime, endTime);

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Doctor is already booked during this time",
      });
    }

    const appointment = await Appointment.create({
      doctor,
      patient,
      startTime,
      endTime,
      status: "BOOKED",
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to book appointment",
    });
  }
};

const getAppointments = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const appointments = await Appointment.find()
      .populate("doctor", "name specialization")
      .populate("patient", "name phone email")
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments();

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
    });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Appointment is already cancelled",
      });
    }

    const now = new Date();
    const hoursUntilStart =
      (appointment.startTime - now) / (1000 * 60 * 60);

    const cancellationFee = hoursUntilStart >= 2 ? 0 : 100;

    appointment.status = "CANCELLED";
    appointment.cancellationFee = cancellationFee;
    appointment.cancelledAt = now;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      cancellationFee,
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
    });
  }
};

const rescheduleAppointment = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "New start time and end time are required",
      });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled appointment cannot be rescheduled",
      });
    }

    const conflict = await checkOverlap(
      appointment.doctor,
      startTime,
      endTime,
      appointment._id
    );

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Doctor is already booked during the new time",
      });
    }

    appointment.startTime = startTime;
    appointment.endTime = endTime;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reschedule appointment",
    });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  cancelAppointment,
  rescheduleAppointment,
};
