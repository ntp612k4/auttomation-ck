const express = require("express");
const router = express.Router();
const onboardingController = require("../controllers/onboardingController");

// POST /api/onboarding/start
router.post("/start", onboardingController.startOnboardingProcess);

module.exports = router;
