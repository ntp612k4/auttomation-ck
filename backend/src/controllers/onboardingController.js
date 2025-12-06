const pool = require("../config/database");
const axios = require("axios");

/**
 * ✅ Gửi email chào mừng và thông báo ngày bắt đầu làm việc cho ứng viên
 * 1. Lấy thông tin ứng viên từ bảng applicant_pass
 * 2. Gọi webhook n8n để gửi Welcome Email
 * (Không thay đổi dữ liệu database)
 */
exports.startOnboardingProcess = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { applicant_id, start_date, document_link } = req.body;

    if (!applicant_id || !start_date) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: applicant_id, start_date",
      });
    }

    // 1. Lấy thông tin ứng viên từ applicant_pass để có email và tên
    const [applicants] = await connection.query(
      "SELECT * FROM applicant_pass WHERE id = ?",
      [applicant_id]
    );

    if (applicants.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy ứng viên với ID = ${applicant_id}`,
      });
    }
    const applicant = applicants[0];

    // 2. Gọi webhook n8n để gửi Welcome Email
    const n8nWebhookUrl = process.env.N8N_WELCOME_EMAIL_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      throw new Error("N8N_WELCOME_EMAIL_WEBHOOK_URL is not defined in .env");
    }

    await axios.post(n8nWebhookUrl, {
      full_name: applicant.full_name,
      email: applicant.email,
      position: applicant.position,
      start_date: start_date,
      document_link: document_link || "",
    });

    // --- CÁC THAO TÁC DATABASE ĐÃ ĐƯỢC VÔ HIỆU HÓA ---
    /*
    // Không chèn vào bảng employees
    const employeeQuery = ...
    await connection.query(employeeQuery, [...]);

    // Không xóa khỏi bảng applicant_pass
    await connection.query("DELETE FROM applicant_pass WHERE id = ?", [
      applicant_id,
    ]);
    */

    // ✅ Cập nhật lại thông báo thành công
    res.status(200).json({
      success: true,
      message: `✅ Đã gửi email chào mừng tới ${applicant.full_name} thành công!`,
    });
  } catch (error) {
    // Không cần rollback vì không có transaction
    console.error("❌ Lỗi khi gửi email chào mừng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi gửi yêu cầu onboarding",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};
