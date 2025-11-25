const axios = require("axios");
require("dotenv").config();

const N8N_WEBHOOK_BASE_URL = "http://n8n:5678/webhook"; // Đảm bảo đây là URL production

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

// Nhi
exports.sendMailCandidate = async (req, res) => {
  console.log("📬 Received request to send mail to candidate:", req.body);
  try {
    // URL này phải khớp với URL Webhook trong n8n của bạn
    const webhookUrl = `${N8N_WEBHOOK_BASE_URL}/send-interview-invite`;

    console.log(`Forwarding request to n8n webhook: ${webhookUrl}`);

    const response = await axios.post(webhookUrl, req.body);

    console.log("✅ n8n webhook responded:", response.data);
    res.json({
      success: true,
      message: "Yêu cầu gửi mail đã được chuyển tiếp thành công đến n8n.",
      data: response.data,
    });
  } catch (error) {
    console.error("❌ Error forwarding request to n8n webhook:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi khi chuyển tiếp yêu cầu đến n8n.",
      error: error.message,
    });
  }
};

/**Nhi
 * @description Gửi mail cho ứng viên (pass/fail)
 */
exports.sendMailCandidate = async (req, res) => {
  console.log("📬 Received request to send mail to candidate:", req.body);
  try {
    // URL này phải khớp với URL Webhook trong n8n của bạn
    const webhookUrl = `${N8N_WEBHOOK_BASE_URL}/send-interview-invite`;

    console.log(`Forwarding request to n8n webhook: ${webhookUrl}`);

    const response = await axios.post(webhookUrl, req.body);

    console.log("✅ n8n webhook responded:", response.data);
    res.json({
      success: true,
      message: "Yêu cầu gửi mail đã được chuyển tiếp thành công đến n8n.",
      data: response.data,
    });
  } catch (error) {
    console.error("❌ Error forwarding request to n8n webhook:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi khi chuyển tiếp yêu cầu đến n8n.",
      error: error.message,
    });
  }
};

exports.sendInterviewInvites = async (req, res) => {
  try {
    const { interview_time, interview_date } = req.body;
    if (!interview_time || !interview_date)
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ ngày và giờ phỏng vấn." });
    const n8nWebhookUrl = process.env.N8N_INTERVIEW_INVITE_WEBHOOK_URL;
    if (!n8nWebhookUrl)
      return res
        .status(500)
        .json({ message: "Chưa cấu hình Webhook URL cho n8n." });
    await axios.post(n8nWebhookUrl, { interview_time, interview_date });
    res
      .status(200)
      .json({ message: "Yêu cầu gửi mail hàng loạt đã được gửi thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra khi gửi yêu cầu đến n8n." });
  }
};

/**Nguyệt
 * @description Kích hoạt luồng đánh giá ứng viên trên n8n
 */
exports.triggerCandidateEvaluation = async (req, res) => {
  console.log("🚀 Received request to trigger candidate evaluation workflow.");
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

// mạnh
/**
 * @description Kích hoạt luồng đánh giá ứng viên trên n8n
 */
exports.triggerCandidateEvaluation = async (req, res) => {
  console.log("⭐ Received request to trigger candidate evaluation workflow.");
  try {
    const webhookUrl = `${N8N_WEBHOOK_BASE_URL}/trigger-candidate-evaluation`;

    console.log(`📤 Forwarding request to n8n webhook: ${webhookUrl}`);
    
    // Gọi n8n webhook
    const response = await axios.post(webhookUrl, {
      timestamp: new Date().toISOString(),
      source: "dashboard-evaluation-trigger"
    });

    console.log("✅ n8n webhook responded successfully");
    
    res.json({
      success: true,
      message: "Yêu cầu đánh giá ứng viên đã được gửi đến hệ thống tự động.",
      n8nResponse: response.data,
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
/**Mạnh
 * @description Kích hoạt luồng khảo sát nhân viên trên n8n
 */
exports.triggerEmployeeSurvey = async (req, res) => {
  console.log("📋 Received request to trigger employee survey workflow.");
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
