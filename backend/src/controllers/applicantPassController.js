const pool = require("../config/database");
const axios = require("axios");

// Nhi
/**
 * Lưu ứng viên đã pass
 * POST /api/applicant-pass
 */
exports.savePassedApplicant = async (req, res) => {
  try {
    const {
      full_name,
      email,
      position,
      ai_overall_score,
      ai_recommendation,
      is_passed,
    } = req.body;

    if (!full_name || !email || !position) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: full_name, email, position",
      });
    }

    console.log(`📥 Saving passed applicant: ${full_name}`);

    const query = `
      INSERT INTO applicant_pass (full_name, email, position, ai_overall_score, ai_recommendation, is_passed)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        full_name = VALUES(full_name),
        position = VALUES(position),
        ai_overall_score = VALUES(ai_overall_score),
        ai_recommendation = VALUES(ai_recommendation),
        is_passed = VALUES(is_passed)
    `;

    const values = [
      full_name,
      email,
      position,
      ai_overall_score || 0,
      ai_recommendation || "ĐẠT",
      is_passed !== false,
    ];

    const [result] = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: `✅ Đã lưu ứng viên pass: ${full_name}`,
      data: {
        id: result.insertId || result.affectedRows,
        full_name,
        email,
        position,
        ai_overall_score,
        ai_recommendation,
        is_passed,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi khi lưu ứng viên pass:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lưu ứng viên pass",
      error: error.message,
    });
  }
};

/**
 * Lấy danh sách ứng viên đã pass
 * GET /api/applicant-pass
 */
exports.getPassedApplicants = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM applicant_pass WHERE is_passed = TRUE ORDER BY id DESC"
    );

    // ✅ QUAN TRỌNG: Return array, không return object
    res.json(rows || []);

    // ❌ XÓA cái này:
    // res.json({
    //   success: true,
    //   count: rows.length,
    //   data: rows,
    // });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách ứng viên pass:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách ứng viên pass",
      error: error.message,
    });
  }
};

/**
 * Xóa ứng viên khỏi danh sách pass
 * DELETE /api/applicant-pass/:id
 */
exports.deletePassedApplicant = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM applicant_pass WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy ứng viên với ID = ${id}`,
      });
    }

    res.json({
      success: true,
      message: "✅ Đã xóa ứng viên thành công",
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa ứng viên:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa ứng viên",
      error: error.message,
    });
  }
};

/**
 * @description Gửi kết quả phỏng vấn cho ứng viên
 * POST /api/send-mail-candidate
 */
exports.sendMailCandidate = async (req, res) => {
  console.log(
    "📬 Received request to send interview result to candidate:",
    req.body
  );

  try {
    const {
      full_name,
      email,
      position,
      status, // "pass" hoặc "fail"
      interview_result, // "passed" hoặc "failed"
      note,
    } = req.body;

    // ✅ Validation
    if (!full_name || !email || !position || !status) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: full_name, email, position, status",
      });
    }

    // ✅ ĐÚNG: Lấy từ env variable N8N_CANDIDATE_MAIL_WEBHOOK_URL
    const webhookUrl = process.env.N8N_CANDIDATE_MAIL_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("❌ N8N_CANDIDATE_MAIL_WEBHOOK_URL not configured");
      return res.status(500).json({
        success: false,
        message: "N8N_CANDIDATE_MAIL_WEBHOOK_URL not configured",
      });
    }

    console.log(`🔗 Forwarding to N8N webhook: ${webhookUrl}`);

    // ✅ Payload
    const payload = {
      full_name,
      email,
      position,
      status, // "pass" or "fail"
      interview_result: status === "pass" ? "passed" : "failed",
      note: note || "",
    };

    console.log("📤 Payload:", JSON.stringify(payload, null, 2));

    // ✅ Gọi N8N webhook
    const response = await axios.post(webhookUrl, payload, {
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ N8N responded successfully:", response.data);

    res.status(200).json({
      success: true,
      message: `✅ Gửi kết quả phỏng vấn thành công cho ${full_name}`,
      data: response.data,
    });
  } catch (error) {
    console.error("❌ Error sending interview result:", error.message);
    console.error("Error response:", error.response?.data);
    console.error("Error config:", error.config?.url);

    res.status(500).json({
      success: false,
      message: "Lỗi khi gửi kết quả phỏng vấn",
      error: error.message,
      details: error.response?.data || "N8N webhook not responding",
    });
  }
};

/**Nhi
 * @description Gửi lịch phỏng vấn hàng loạt cho tất cả ứng viên đạt
 * POST /api/send-interview-invites
 */
exports.sendInterviewInvites = async (req, res) => {
  console.log("📨 Received bulk interview invites request:", req.body);

  try {
    const { interview_date, interview_time, candidates } = req.body;

    // ✅ Validation
    if (!interview_date || !interview_time) {
      return res.status(400).json({
        success: false,
        message: "Missing interview_date or interview_time",
      });
    }

    if (!candidates || candidates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No candidates provided",
      });
    }

    console.log(
      `📋 Sending interview invites to ${candidates.length} candidates`
    );

    // ✅ QUAN TRỌNG: Lấy từ env
    const webhookUrl = process.env.N8N_INTERVIEW_INVITE_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("❌ N8N_INTERVIEW_INVITE_WEBHOOK_URL not configured");
      return res.status(500).json({
        success: false,
        message: "Webhook URL not configured",
      });
    }

    console.log(`🔗 Forwarding to N8N webhook: ${webhookUrl}`);

    // ✅ Payload gửi tới N8N
    const payload = {
      interview_date,
      interview_time,
      candidates: candidates, // Gửi toàn bộ danh sách
      total_count: candidates.length,
    };

    console.log("📤 Payload:", JSON.stringify(payload, null, 2));

    // ✅ Call N8N
    const response = await axios.post(webhookUrl, payload, {
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ N8N responded:", response.data);

    res.status(200).json({
      success: true,
      message: `✅ Gửi lịch phỏng vấn cho ${candidates.length} ứng viên`,
      data: response.data,
    });
  } catch (error) {
    console.error("❌ Error sending interview invites:", error.message);
    console.error("Error response:", error.response?.data);

    res.status(500).json({
      success: false,
      message: "Lỗi khi gửi lịch phỏng vấn",
      error: error.message,
    });
  }
};
