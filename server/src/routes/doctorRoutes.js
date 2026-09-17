const express = require("express");

const {
  createDoctor,
  getDoctors,
  updateDoctor,
} = require("../controllers/doctorController");

const router = express.Router();

router.post("/", createDoctor);
router.get("/", getDoctors);
router.patch("/:id", updateDoctor);

module.exports = router;
