const axios = require("axios");
require("dotenv").config();

// ✅ CREATE AXIOS INSTANCE: Tăng timeout cho bulk requests
const axiosInstance = axios.create({
  timeout: parseInt(process.env.AXIOS_TIMEOUT || 60000),
  headers: {
    "Content-Type": "application/json",
  },
});

const N8N_WEBHOOK_BASE_URL =
  process.env.N8N_WEBHOOK_BASE_URL || "http://n8n:5678/webhook-test";

exports.postJob = async (req, res) => {
  try {
    const n8nWebhookUrl = process.env.N8N_JOB_POST_WEBHOOK_URL;
    if (!n8nWebhookUrl)
      return res
        .status(500)
        .json({ message: "Chưa cấu hình Webhook URL cho n8n." });
    await axios.post(n8nWebhookUrl, req.body);
    res
      .status(200)
      .json({ message: "Yêu cầu đăng tin đã được gửi thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra khi gửi yêu cầu đến n8n." });
  }
};

/**Nhi
 * @description Gửi kết quả phỏng vấn cho ứng viên
 * POST /api/send-mail-candidate
 */
exports.sendMailCandidate = async (req, res) => {
  console.log(
    "📬 [sendMailCandidate] Received request to send result to candidate:",
    req.body
  );

  try {
    const { name, email, position, status, interview_result, note } =
      req.body;

    // ✅ Validation
    if (!name || !email || !position || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // ✅ ĐÚNG: Lấy từ env, không hardcode
    const webhookUrl = process.env.N8N_CANDIDATE_MAIL_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("❌ N8N_CANDIDATE_MAIL_WEBHOOK_URL not configured in .env");
      return res.status(500).json({
        success: false,
        message: "Webhook URL not configured",
      });
    }

    console.log(`🔗 Forwarding to N8N webhook: ${webhookUrl}`);

    const payload = {
      name,
      email,
      position,
      status,
      interview_result: status === "pass" ? "passed" : "failed",
      note: note || "",
    };

    console.log("📤 Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(webhookUrl, payload, {
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ n8n webhook responded:", response.data);

    res.status(200).json({
      success: true,
      message: `✅ Gửi kết quả thành công cho ${name}`,
      data: response.data,
    });
  } catch (error) {
    console.error("❌ Error forwarding request to n8n webhook:", error.message);
    console.error("Error response:", error.response?.data);

    res.status(500).json({
      success: false,
      message: "Lỗi khi gửi kết quả phỏng vấn",
      error: error.message,
      details: error.response?.data,
    });
  }
};

/**
 * ✅ SEND INTERVIEW INVITES (HÀNG LOẠT)
 * POST /api/send-interview-invites
 *
 * Request body:
 * {
 *   interview_date: "2025-12-05",
 *   interview_time: "09:00",
 *   candidates: [
 *     { name, email, position, ai_overall_score },
 *     ...
 *   ]
 * }
 *
 * Flow:
 * 1. Receive request từ Frontend
 * 2. Validate data
 * 3. Build payload với tất cả candidates
 * 4. Gửi 1 request tới N8N webhook
 * 5. N8N loop qua candidates → gửi mail từng người
 */
exports.sendInterviewInvites = async (req, res) => {
  console.log("📨 [sendInterviewInvites] Request received");
  console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

  try {
    const { interview_date, interview_time, candidates } = req.body;

    // ✅ VALIDATION 1
    if (!interview_date || !interview_time) {
      console.error("❌ Missing interview_date or interview_time");
      return res.status(400).json({
        success: false,
        message: "Missing interview_date or interview_time",
      });
    }

    // ✅ VALIDATION 2
    if (!Array.isArray(candidates) || candidates.length === 0) {
      console.error("❌ Invalid candidates array:", candidates);
      return res.status(400).json({
        success: false,
        message: "No valid candidates provided",
      });
    }

    // ✅ VALIDATION 3
    const validCandidates = candidates.filter((c) => c.email && c.name);

    if (validCandidates.length === 0) {
      console.error("❌ No valid candidates after filtering");
      return res.status(400).json({
        success: false,
        message: "No valid candidates with email and name",
      });
    }

    console.log(
      `📋 Processing ${validCandidates.length} candidates for interview invites`
    );

    // ✅ GET WEBHOOK URL
    const webhookUrl = process.env.N8N_INTERVIEW_INVITE_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("❌ N8N_INTERVIEW_INVITE_WEBHOOK_URL not configured");
      console.error("❌ Env vars:", {
        N8N_INTERVIEW_INVITE_WEBHOOK_URL:
          process.env.N8N_INTERVIEW_INVITE_WEBHOOK_URL,
        N8N_WEBHOOK_BASE_URL: process.env.N8N_WEBHOOK_BASE_URL,
      });
      return res.status(500).json({
        success: false,
        message: "Webhook URL not configured",
      });
    }

    console.log(`🔗 Webhook URL: ${webhookUrl}`);

    // ✅ BUILD PAYLOAD
    const payload = {
      interview_date: interview_date,
      interview_date_display: req.body.interview_date_display, // "05/12/2025"
      interview_date_parts: req.body.interview_date_parts, // { day, month, year }
      interview_time: interview_time,
      candidates: validCandidates,
      total_count: validCandidates.length,
      timestamp: new Date().toISOString(),
    };

    console.log(
      "📤 Payload with all date formats:",
      JSON.stringify(payload, null, 2)
    );

    // ✅ SEND TO N8N
    const response = await axiosInstance.post(webhookUrl, payload);

    console.log("✅ N8N responded:", response.data);

    res.status(200).json({
      success: true,
      message: `✅ Sent interview invites to ${validCandidates.length} candidates`,
      data: response.data,
      stats: {
        total_requested: candidates.length,
        total_sent: validCandidates.length,
        interview_date: interview_date,
        interview_time: interview_time,
      },
    });
  } catch (error) {
    console.error("❌ [sendInterviewInvites] Full error:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack,
    });

    // ✅ TIMEOUT
    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        message: "Request timeout - N8N took too long to respond",
        error: error.message,
      });
    }

    // ✅ OTHER ERRORS
    res.status(500).json({
      success: false,
      message: "Error sending interview invites",
      error: error.message,
      details: error.response?.data,
    });
  }
};

/**
 * @description Kích hoạt luồng đánh giá ứng viên trên n8n
 */
exports.triggerCandidateEvaluation = async (req, res) => {
  try {
    // URL này phải khớp với URL Webhook mới trong n8n
    const webhookUrl = `${N8N_WEBHOOK_BASE_URL}/trigger-candidate-evaluation`;

    console.log(`Forwarding request to n8n webhook: ${webhookUrl}`);
    // Dùng POST với body rỗng để kích hoạt webhook
    await axios.post(webhookUrl, {});

    res.json({
      success: true,
      message: "Yêu cầu đánh giá ứng viên đã được gửi đến hệ thống tự động.",
    });
  } catch (error) {
    console.error("❌ Error triggering n8n workflow:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi khi kích hoạt luồng đánh giá.",
      error: error.message,
    });
  }
};

/**
 * @description Kích hoạt luồng khảo sát nhân viên trên n8n
 */
exports.triggerEmployeeSurvey = async (req, res) => {
  try {
    const webhookUrl = `${N8N_WEBHOOK_BASE_URL}/trigger-employee-survey`;

    console.log(`Forwarding request to n8n webhook: ${webhookUrl}`);
    await axios.post(webhookUrl, {});

    res.json({
      success: true,
      message: "Yêu cầu khảo sát nhân viên đã được gửi đến hệ thống tự động.",
    });
  } catch (error) {
    console.error("❌ Error triggering n8n survey workflow:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi khi kích hoạt luồng khảo sát.",
      error: error.message,
    });
  }
};
