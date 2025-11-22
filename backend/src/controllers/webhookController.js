const axios = require("axios");
require("dotenv").config();

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

exports.sendMailCandidate = async (req, res) => {
  try {
    const n8nWebhookUrl = process.env.N8N_CANDIDATE_MAIL_WEBHOOK_URL;
    if (!n8nWebhookUrl)
      return res.status(500).json({ message: "Chưa cấu hình Webhook URL." });
    await axios.post(n8nWebhookUrl, req.body);
    res.status(200).json({ message: "Đã gửi thông tin sang n8n thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Không gửi được dữ liệu sang n8n" });
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
