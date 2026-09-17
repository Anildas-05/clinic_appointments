const Doctor = require("../models/Doctor");

const createDoctor = async (req, res) => {
  try {
    const { name, specialization, availableFrom, availableTo } = req.body;

    if (!name || !specialization) {
      return res.status(400).json({
        success: false,
        message: "Name and specialization are required",
      });
    }

    const doctor = await Doctor.create({
      name,
      specialization,
      availableFrom,
      availableTo,
    });

    res.status(201).json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create doctor",
    });
  }
};

const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update doctor",
    });
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  updateDoctor,
};
