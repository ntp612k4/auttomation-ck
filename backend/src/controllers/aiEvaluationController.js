const pool = require("../config/database");

/**
 * Lưu kết quả AI evaluation (bao gồm position trong response)
 * POST /api/ai-evaluation
 */
exports.saveEvaluation = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      position,
      education_score,
      language_score,
      experience_score,
      skills_score,
      motivation_score,
      ai_overall_score,
      ai_recommendation,
      is_passed,
      ai_reasoning,
      strengths,
      concerns,
      interview_topics,
    } = req.body;

    if (!email || !full_name || !position) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: email, full_name, position",
      });
    }

    const query = `
      INSERT INTO ai_evaluation_results (
        full_name, email, phone, position,
        education_score, language_score, experience_score, 
        skills_score, motivation_score, ai_overall_score,
        ai_recommendation, is_passed, ai_reasoning,
        strengths, concerns, interview_topics
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      full_name,
      email,
      phone || null,
      position,
      education_score || 0,
      language_score || 0,
      experience_score || 0,
      skills_score || 0,
      motivation_score || 0,
      ai_overall_score || 0,
      ai_recommendation || "PENDING",
      is_passed || false,
      ai_reasoning || "",
      JSON.stringify(strengths || []),
      JSON.stringify(concerns || []),
      JSON.stringify(interview_topics || []),
    ];

    const [result] = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "✅ Đã lưu kết quả AI đánh giá thành công!",
      data: {
        id: result.insertId,
        full_name,
        email,
        phone,
        position, // 👈 Thêm position vào response
        education_score: education_score || 0,
        language_score: language_score || 0,
        experience_score: experience_score || 0,
        skills_score: skills_score || 0,
        motivation_score: motivation_score || 0,
        ai_overall_score,
        ai_recommendation,
        is_passed,
        ai_reasoning,
        strengths: strengths || [],
        concerns: concerns || [],
        interview_topics: interview_topics || [],
        evaluated_at: new Date().toISOString(),
        status: "NEW",
      },
    });
  } catch (error) {
    console.error("❌ Lỗi khi lưu kết quả AI:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lưu kết quả AI",
      error: error.message,
    });
  }
};

/**
 * Lấy danh sách AI evaluations (bao gồm position)
 * GET /api/ai-evaluation
 */
exports.getEvaluations = async (req, res) => {
  try {
    const { status, is_passed, position, limit = 50 } = req.query;

    let query = "SELECT * FROM ai_evaluation_results WHERE 1=1";
    const params = [];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    if (is_passed !== undefined) {
      query += " AND is_passed = ?";
      params.push(is_passed === "true" ? 1 : 0);
    }

    if (position) {
      query += " AND position LIKE ?";
      params.push(`%${position}%`);
    }

    query += " ORDER BY evaluated_at DESC LIMIT ?";
    params.push(parseInt(limit));

    const [rows] = await pool.query(query, params);

    const results = rows.map((row) => ({
      ...row,
      strengths: JSON.parse(row.strengths || "[]"),
      concerns: JSON.parse(row.concerns || "[]"),
      interview_topics: JSON.parse(row.interview_topics || "[]"),
      // 👈 Position đã có sẵn trong row từ database
    }));

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy kết quả AI:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách kết quả AI",
      error: error.message,
    });
  }
};

/**
 * Cập nhật status AI evaluation
 * PUT /api/ai-evaluation/:id/status
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["NEW", "REVIEWED", "CONTACTED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status không hợp lệ. Chọn: ${validStatuses.join(", ")}`,
      });
    }

    // 👈 Lấy thông tin ứng viên trước khi update
    const [current] = await pool.query(
      "SELECT full_name, email, position FROM ai_evaluation_results WHERE id = ?",
      [id]
    );

    if (current.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy kết quả AI với ID = ${id}`,
      });
    }

    const [result] = await pool.query(
      "UPDATE ai_evaluation_results SET status = ? WHERE id = ?",
      [status, id]
    );

    res.json({
      success: true,
      message: `✅ Đã cập nhật status thành ${status}`,
      data: {
        id: parseInt(id),
        full_name: current[0].full_name,
        email: current[0].email,
        position: current[0].position, // 👈 Bao gồm position trong response
        status: status,
        updated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật status",
      error: error.message,
    });
  }
};
