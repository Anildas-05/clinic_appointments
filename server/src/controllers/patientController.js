const Patient = require("../models/Patient");

const createPatient = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    const patient = await Patient.create({
      name,
      phone,
      email,
    });

    res.status(201).json({
      success: true,
      patient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create patient",
    });
  }
};

const getPatients = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const filter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const patients = await Patient.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Patient.countDocuments(filter);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      patients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch patients",
    });
  }
};

const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update patient",
    });
  }
};

module.exports = {
  createPatient,
  getPatients,
  updatePatient,
};
