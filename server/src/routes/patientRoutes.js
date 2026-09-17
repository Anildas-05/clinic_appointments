const express = require("express");

const {
  createPatient,
  getPatients,
  updatePatient,
} = require("../controllers/patientController");

const router = express.Router();

router.post("/", createPatient);
router.get("/", getPatients);
router.patch("/:id", updatePatient);

module.exports = router;
