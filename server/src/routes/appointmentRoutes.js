const express = require("express");

const {
  createAppointment,
  getAppointments,
  cancelAppointment,
  rescheduleAppointment,
} = require("../controllers/appointmentController");

const router = express.Router();

router.post("/", createAppointment);
router.get("/", getAppointments);
router.patch("/:id/cancel", cancelAppointment);
router.patch("/:id/reschedule", rescheduleAppointment);

module.exports = router;
