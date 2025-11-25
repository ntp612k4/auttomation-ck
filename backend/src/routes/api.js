const express = require("express");
const router = express.Router();

const statsController = require("../controllers/statsController");
const employeeController = require("../controllers/employeeController");
const applicationController = require("../controllers/applicationController");
const webhookController = require("../controllers/webhookController");
const aiEvaluationController = require("../controllers/aiEvaluationController");
const applicantPassController = require("../controllers/applicantPassController");

// Stats & Overview
router.get("/stats/overview", statsController.getOverview);
router.get("/ai_index", statsController.getAiIndex);
router.get("/employee-analysis", employeeController.getEmployeeAnalysis);
router.post("/employee-analysis", employeeController.addEmployeeAnalysis);

// Mạnh
// Employees & Departments
router.get("/departments", employeeController.getDepartments);
router.get("/departments/details", employeeController.getDepartmentDetails);

// Mạnh
router.get("/employees", employeeController.getEmployees);
router.post("/employees", employeeController.createEmployee);
router.put("/employees/:id", employeeController.updateEmployee);
router.delete("/employees/:id", employeeController.deleteEmployee);

// Nguyệt
// Job Applications routes
router.get("/job_applications", applicationController.getApplications);
router.post("/job_applications", applicationController.createApplication);
router.get(
  "/job_applications/pending-ai-evaluation",
  applicationController.getPendingAiEvaluation
);
router.get("/job_applications/:id", applicationController.getApplicationById);
router.put(
  "/job_applications/:id/status",
  applicationController.updateApplicationStatus
);
// Route mới để kích hoạt luồng đánh giá
router.post(
  "/trigger-evaluation",
  webhookController.triggerCandidateEvaluation
);

// AI Evaluation routes
router.post("/ai-evaluation", aiEvaluationController.saveEvaluation);
router.get("/ai-evaluation", aiEvaluationController.getEvaluations);
router.put("/ai-evaluation/:id/status", aiEvaluationController.updateStatus);

// Mạnh
// Employee Survey Trigger
router.post("/trigger-survey", webhookController.triggerEmployeeSurvey);
router.post("/trigger-evaluation", webhookController.triggerCandidateEvaluation);

// Nhi
// Applicant Pass routes (Simplified)
router.post("/applicant-pass", applicantPassController.savePassedApplicant);
router.get("/applicant-pass", applicantPassController.getPassedApplicants);
router.delete(
  "/applicant-pass/:id",
  applicantPassController.deletePassedApplicant
);

// Webhooks (N8N)
router.post("/recruitment/post", webhookController.postJob);
router.post("/send-mail-candidate", webhookController.sendMailCandidate);
router.post(
  "/applicants-pass/send-interview-invites",
  webhookController.sendInterviewInvites
);

module.exports = router;
