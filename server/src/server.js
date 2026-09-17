const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const doctors = [
  {
    id: 1,
    name: "Dr. Sharma",
    specialization: "General Physician",
    availableFrom: "09:00",
    availableTo: "17:00",
  },
  {
    id: 2,
    name: "Dr. Patel",
    specialization: "Cardiologist",
    availableFrom: "10:00",
    availableTo: "18:00",
  },
  {
    id: 3,
    name: "Dr. Singh",
    specialization: "Dermatologist",
    availableFrom: "08:00",
    availableTo: "16:00",
  },
];

const patients = [
  { id: 1, name: "Ava Johnson", phone: "555-0101", email: "ava@example.com" },
  { id: 2, name: "Daniel Lee", phone: "555-0102", email: "daniel@example.com" },
];

const appointments = [
  {
    id: 1,
    doctorId: 1,
    patientId: 1,
    startTime: "2026-09-18T09:00",
    endTime: "2026-09-18T09:30",
    reason: "Annual wellness consultation",
    status: "Booked",
  },
  {
    id: 2,
    doctorId: 2,
    patientId: 2,
    startTime: "2026-09-19T11:00",
    endTime: "2026-09-19T11:45",
    reason: "Heart rhythm review",
    status: "Booked",
  },
];

const notifications = [];

let nextDoctorId = doctors.length + 1;
let nextPatientId = patients.length + 1;
let nextAppointmentId = appointments.length + 1;

const normalizeId = (value) => {
  if (typeof value === "string" && value.trim() !== "") {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? value : numeric;
  }

  return value;
};

const findDoctor = (id) => doctors.find((doctor) => doctor.id === Number(id));
const findPatient = (id) => patients.find((patient) => patient.id === Number(id));

const hasConflict = (doctorId, startTime, endTime, excludeId = null) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  return appointments.some((appointment) => {
    if (appointment.id === excludeId) return false;
    if (appointment.doctorId !== Number(doctorId)) return false;
    if (appointment.status === "Cancelled") return false;

    const existingStart = new Date(appointment.startTime);
    const existingEnd = new Date(appointment.endTime);

    return existingStart < end && existingEnd > start;
  });
};

const formatAppointmentResponse = (appointment) => ({
  ...appointment,
  doctor: findDoctor(appointment.doctorId),
  patient: findPatient(appointment.patientId),
});

const buildReminderMessage = (appointment, patient) => {
  const start = new Date(appointment.startTime);
  return `Reminder: ${patient.name}, you have an appointment with ${findDoctor(appointment.doctorId)?.name || "your doctor"} today at ${start.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}.`;
};

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "MediPulse API is running" });
});

app.get("/api/doctors", (req, res) => {
  const search = (req.query.search || "").trim().toLowerCase();
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;
  const sortBy = req.query.sortBy || "name";
  const order = String(req.query.order || "asc").toLowerCase() === "desc" ? -1 : 1;

  let result = [...doctors];

  if (search) {
    result = result.filter((doctor) =>
      doctor.name.toLowerCase().includes(search) ||
      doctor.specialization.toLowerCase().includes(search)
    );
  }

  result = result.sort((a, b) => {
    const left = a[sortBy] ?? "";
    const right = b[sortBy] ?? "";
    return String(left).localeCompare(String(right)) * order;
  });

  const total = result.length;
  const paginated = result.slice(skip, skip + limit);

  res.json({
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    doctors: paginated,
  });
});

app.post("/api/doctors", (req, res) => {
  const { name, specialization, availability, availableFrom, availableTo } = req.body;

  if (!name || !specialization) {
    return res.status(400).json({
      success: false,
      message: "Doctor name and specialization are required.",
    });
  }

  const doctor = {
    id: nextDoctorId++,
    name: String(name).trim(),
    specialization: String(specialization).trim(),
    availability: availability || `${availableFrom || "09:00"} - ${availableTo || "17:00"}`,
    availableFrom: availableFrom || "09:00",
    availableTo: availableTo || "17:00",
  };

  doctors.push(doctor);

  res.status(201).json({ success: true, message: "Doctor added successfully.", doctor });
});

app.get("/api/patients", (req, res) => {
  const search = (req.query.search || "").trim().toLowerCase();
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;
  const sortBy = req.query.sortBy || "name";
  const order = String(req.query.order || "asc").toLowerCase() === "desc" ? -1 : 1;

  let result = [...patients];

  if (search) {
    result = result.filter((patient) =>
      patient.name.toLowerCase().includes(search) ||
      patient.phone.includes(search) ||
      patient.email.toLowerCase().includes(search)
    );
  }

  result = result.sort((a, b) => {
    const left = a[sortBy] ?? "";
    const right = b[sortBy] ?? "";
    return String(left).localeCompare(String(right)) * order;
  });

  const total = result.length;
  const paginated = result.slice(skip, skip + limit);

  res.json({
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    patients: paginated,
  });
});

app.post("/api/patients", (req, res) => {
  const { name, phone, email } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({
      success: false,
      message: "Name, phone, and email are required.",
    });
  }

  const patient = {
    id: nextPatientId++,
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: String(email).trim(),
  };

  patients.push(patient);

  res.status(201).json({ success: true, message: "Patient added successfully.", patient });
});

const runClockAutomation = (req, res) => {
  const now = req.body.now ? new Date(req.body.now) : new Date();

  if (Number.isNaN(now.getTime())) {
    return res.status(400).json({ success: false, message: "Invalid date provided." });
  }

  let noShowsMarked = 0;

  for (const appointment of appointments) {
    if (["Booked", "Confirmed"].includes(appointment.status)) {
      const start = new Date(appointment.startTime);
      const noShowCutoff = new Date(start.getTime() + 30 * 60 * 1000);

      if (now >= noShowCutoff && appointment.status !== "Completed") {
        appointment.status = "No Show";
        noShowsMarked += 1;
      }
    }
  }

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const reminderTarget = appointments.filter((appointment) => {
    const start = new Date(appointment.startTime);
    return (
      appointment.status !== "Cancelled" &&
      appointment.status !== "No Show" &&
      start >= startOfDay &&
      start < endOfDay
    );
  });

  const reminderItems = [];

  for (const appointment of reminderTarget) {
    const patient = findPatient(appointment.patientId);
    if (!patient) continue;

    const dedupeKey = `REMINDER-${appointment.id}-${startOfDay.toISOString().slice(0, 10)}`;
    const alreadyExists = notifications.some((entry) => entry.dedupeKey === dedupeKey);

    if (!alreadyExists) {
      const notification = {
        id: notifications.length + 1,
        appointmentId: appointment.id,
        patientId: patient.id,
        type: "APPOINTMENT_REMINDER",
        message: buildReminderMessage(appointment, patient),
        status: "PENDING",
        dedupeKey,
        createdAt: new Date().toISOString(),
      };

      notifications.push(notification);
      reminderItems.push(notification);
    }
  }

  return res.json({
    success: true,
    message: "Clock automation executed.",
    noShowsMarked,
    remindersCreated: reminderItems.length,
    notifications: reminderItems,
  });
};

const getOutboxData = (req, res) => {
  res.json({
    success: true,
    count: notifications.length,
    notifications,
  });
};

app.get("/api/appointments", (req, res) => {
  const patientName = (req.query.patient || req.query.patientName || "").trim().toLowerCase();
  const doctorId = req.query.doctorId ? Number(req.query.doctorId) : null;
  const status = (req.query.status || "").trim().toLowerCase();
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;
  const sortBy = req.query.sortBy || "startTime";
  const order = String(req.query.order || "asc").toLowerCase() === "desc" ? -1 : 1;

  let results = appointments.map(formatAppointmentResponse);

  if (patientName) {
    results = results.filter((appointment) =>
      appointment.patient?.name?.toLowerCase().includes(patientName)
    );
  }

  if (doctorId) {
    results = results.filter((appointment) => appointment.doctorId === doctorId);
  }

  if (status) {
    results = results.filter((appointment) => appointment.status.toLowerCase() === status);
  }

  results = results.sort((a, b) => {
    const left = new Date(a[sortBy] || 0).getTime();
    const right = new Date(b[sortBy] || 0).getTime();
    return (left - right) * order;
  });

  const total = results.length;
  const paginated = results.slice(skip, skip + limit);

  res.json({
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    appointments: paginated,
  });
});

app.get("/api/doctors/:id/appointments", (req, res) => {
  const doctorId = Number(req.params.id);
  const doctor = findDoctor(doctorId);

  if (!doctor) {
    return res.status(404).json({ success: false, message: "Doctor not found." });
  }

  const doctorAppointments = appointments
    .filter((appointment) => appointment.doctorId === doctorId)
    .map(formatAppointmentResponse)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  res.json({ success: true, doctor, appointments: doctorAppointments });
});

app.get("/api/patients/:id/appointments", (req, res) => {
  const patientId = Number(req.params.id);
  const patient = findPatient(patientId);

  if (!patient) {
    return res.status(404).json({ success: false, message: "Patient not found." });
  }

  const patientAppointments = appointments
    .filter((appointment) => appointment.patientId === patientId)
    .map(formatAppointmentResponse)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  res.json({ success: true, patient, appointments: patientAppointments });
});

app.post("/api/appointments", (req, res) => {
  const doctorId = normalizeId(req.body.doctorId ?? req.body.doctor);
  const patientId = normalizeId(req.body.patientId ?? req.body.patient);
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const reason = req.body.reason || "General consultation";

  if (!doctorId || !patientId || !startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: "Doctor, patient, start time, and end time are required.",
    });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return res.status(400).json({
      success: false,
      message: "Appointment end time must be later than the start time.",
    });
  }

  if (!findDoctor(Number(doctorId))) {
    return res.status(404).json({ success: false, message: "Doctor not found." });
  }

  if (!findPatient(Number(patientId))) {
    return res.status(404).json({ success: false, message: "Patient not found." });
  }

  if (hasConflict(doctorId, startTime, endTime)) {
    return res.status(409).json({
      success: false,
      message: "Doctor already has an overlapping appointment.",
    });
  }

  const appointment = {
    id: nextAppointmentId++,
    doctorId: Number(doctorId),
    patientId: Number(patientId),
    startTime,
    endTime,
    reason: String(reason).trim() || "General consultation",
    status: "Booked",
  };

  appointments.push(appointment);

  res.status(201).json({
    success: true,
    message: "Appointment booked successfully.",
    appointment: formatAppointmentResponse(appointment),
  });
});

app.patch("/api/appointments/:id/cancel", (req, res) => {
  const id = Number(req.params.id);
  const appointment = appointments.find((item) => item.id === id);

  if (!appointment) {
    return res.status(404).json({ success: false, message: "Appointment not found." });
  }

  if (appointment.status === "Cancelled") {
    return res.status(400).json({ success: false, message: "Appointment is already cancelled." });
  }

  const now = new Date();
  const hoursUntilStart = (new Date(appointment.startTime).getTime() - now.getTime()) / (1000 * 60 * 60);
  const cancellationFee = hoursUntilStart >= 2 ? 0 : 100;

  appointment.status = "Cancelled";
  appointment.cancellationFee = cancellationFee;
  appointment.cancelledAt = now.toISOString();

  res.json({
    success: true,
    message: "Appointment cancelled successfully.",
    cancellationFee,
    appointment: formatAppointmentResponse(appointment),
  });
});

app.patch("/api/appointments/:id/reschedule", (req, res) => {
  const id = Number(req.params.id);
  const appointment = appointments.find((item) => item.id === id);

  if (!appointment) {
    return res.status(404).json({ success: false, message: "Appointment not found." });
  }

  if (appointment.status === "Cancelled") {
    return res.status(400).json({
      success: false,
      message: "Cancelled appointment cannot be rescheduled.",
    });
  }

  const { startTime, endTime } = req.body;

  if (!startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: "New start time and end time are required.",
    });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return res.status(400).json({
      success: false,
      message: "Rescheduled end time must be later than the new start time.",
    });
  }

  if (hasConflict(appointment.doctorId, startTime, endTime, appointment.id)) {
    return res.status(409).json({
      success: false,
      message: "Reschedule conflicts with the doctor’s existing schedule.",
    });
  }

  appointment.startTime = startTime;
  appointment.endTime = endTime;

  res.json({
    success: true,
    message: "Appointment rescheduled successfully.",
    appointment: formatAppointmentResponse(appointment),
  });
});

app.post("/api/clock", runClockAutomation);
app.get("/api/clock/outbox", getOutboxData);

app.post("/clock", runClockAutomation);
app.get("/outbox", getOutboxData);

app.listen(PORT, () => {
  console.log(`MediPulse backend running on port ${PORT}`);
});
