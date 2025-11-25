const express = require("express");
const router = express.Router();
const aiEvaluationController = require("../controllers/aiEvaluationController");

// POST /api/ai-evaluation - Lưu kết quả AI đánh giá
router.post("/", aiEvaluationController.saveEvaluation);

// GET /api/ai-evaluation - Lấy danh sách kết quả
router.get("/", aiEvaluationController.getEvaluations);

// PUT /api/ai-evaluation/:id/status - Cập nhật status
router.put("/:id/status", aiEvaluationController.updateStatus);

module.exports = router;
