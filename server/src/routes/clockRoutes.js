const express = require("express");

const {
  runClock,
  getOutbox,
} = require("../controllers/clockController");

const router = express.Router();

router.post("/", runClock);
router.get("/outbox", getOutbox);

module.exports = router;
