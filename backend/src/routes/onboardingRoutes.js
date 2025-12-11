const express = require("express");
const router = express.Router();
const onboardingController = require("../controllers/onboardingController");

/**
 * ✅ Route 1: Gửi Welcome Email
 * POST /api/onboarding/start
 * Body: { applicant_id, start_date, document_link (optional) }
 */
router.post("/start", onboardingController.startOnboardingProcess);

/**
 * ✅ Route 2 (MỚI): Tiếp nhận ứng viên làm nhân viên chính thức
 * POST /api/onboarding/accept-employee
 * Body: { applicant_id }
 */
router.post("/accept-employee", onboardingController.acceptEmployeeProcess);

module.exports = router;
