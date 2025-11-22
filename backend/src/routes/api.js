const express = require("express");
const router = express.Router();

const statsController = require("../controllers/statsController");
const employeeController = require("../controllers/employeeController");
const applicationController = require("../controllers/applicationController");
const webhookController = require("../controllers/webhookController");

// Stats & Overview
router.get("/stats/overview", statsController.getOverview);
router.get("/ai_index", statsController.getAiIndex); // Mapping client logic "ai_index" -> getEmployeeAnalysis thực tế
router.get("/employee-analysis", employeeController.getEmployeeAnalysis);
router.post("/employee-analysis", employeeController.addEmployeeAnalysis);

// Employees & Departments
router.get("/departments", employeeController.getDepartments);
router.get("/departments/details", employeeController.getDepartmentDetails);
router.get("/employees", employeeController.getEmployees);
router.post("/employees", employeeController.createEmployee);
router.put("/employees/:id", employeeController.updateEmployee);
router.delete("/employees/:id", employeeController.deleteEmployee);

// Job Applications
router.get("/job_applications", applicationController.getApplications);
router.post("/job_applications", applicationController.createApplication);
router.put(
  "/job_applications/:id/ai_result",
  applicationController.updateAiResult
);
router.get("/ai_responses", applicationController.getApplications); // Duplicate endpoint in original server.js

// Applicants Pass
router.post("/applicants_pass", applicationController.createPassApplicant);
router.get("/applicants_pass_dat", applicationController.getPassApplicants);
router.delete(
  "/applicants_pass/:id",
  applicationController.deletePassApplicant
);

// Webhooks (N8N)
router.post("/recruitment/post", webhookController.postJob);
router.post("/send-mail-candidate", webhookController.sendMailCandidate);
router.post(
  "/applicants-pass/send-interview-invites",
  webhookController.sendInterviewInvites
);

module.exports = router;
