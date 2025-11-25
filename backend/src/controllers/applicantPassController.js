const pool = require("../config/database");

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

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
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
