// Nguyệt
const pool = require("../config/database");

/**
 * Lưu kết quả AI đánh giá ứng viên
 * POST /api/ai-evaluation
 */
exports.saveEvaluation = async (req, res) => {
  try {
    const {
      application_id,
      name,
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

    // Validate required fields
    if (!application_id || !email || !name) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: application_id, email, name",
      });
    }

    // Insert vào database
    const query = `
      INSERT INTO ai_evaluation_results (
        application_id, name, email, phone, position,
        education_score, language_score, experience_score, 
        skills_score, motivation_score, ai_overall_score,
        ai_recommendation, is_passed, ai_reasoning,
        strengths, concerns, interview_topics
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      application_id,
      name,
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
        application_id,
        ai_overall_score,
        ai_recommendation,
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
 * Lấy danh sách job applications
 * GET /api/job_applications
 */
exports.getApplications = async (req, res) => {
  try {
    const { status, position, limit = 50 } = req.query;

    let query = "SELECT * FROM job_applications WHERE 1=1";
    const params = [];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    if (position) {
      query += " AND position LIKE ?";
      params.push(`%${position}%`);
    }

    query += " ORDER BY applied_date DESC LIMIT ?";
    params.push(parseInt(limit));

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy job applications:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách job applications",
      error: error.message,
    });
  }
};

/**
 * Tạo job application mới
 * POST /api/job_applications
 */
exports.createApplication = async (req, res) => {
  try {
    const { name, email, phone, position, resume_url, cover_letter } =
      req.body;

    // Validate required fields
    if (!name || !email || !position) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: name, email, position",
      });
    }

    // Check if email already exists
    const [existingApp] = await pool.query(
      "SELECT id FROM job_applications WHERE email = ?",
      [email]
    );

    if (existingApp.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Email ${email} đã tồn tại trong hệ thống`,
        existing_id: existingApp[0].id,
      });
    }

    const query = `
      INSERT INTO job_applications 
      (name, email, phone, position, resume_url, cover_letter) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      name,
      email,
      phone || null,
      position,
      resume_url || null,
      cover_letter || null,
    ]);

    res.status(201).json({
      success: true,
      message: "✅ Đã tạo job application thành công!",
      data: {
        id: result.insertId,
        name,
        email,
        position,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo job application:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo job application",
      error: error.message,
    });
  }
};

/**
 * Lấy chi tiết job application
 * GET /api/job_applications/:id
 */
exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT ja.*, 
             aer.ai_overall_score,
             aer.ai_recommendation,
             aer.is_passed,
             aer.evaluated_at
      FROM job_applications ja
      LEFT JOIN ai_evaluation_results aer ON ja.id = aer.application_id
      WHERE ja.id = ?
    `;

    const [rows] = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy job application với ID = ${id}`,
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy chi tiết application:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết application",
      error: error.message,
    });
  }
};

/**
 * Lấy applications chưa được đánh giá AI
 * GET /api/job_applications/pending-ai-evaluation
 */
exports.getPendingAiEvaluation = async (req, res) => {
  try {
    const query = `
      SELECT ja.* 
      FROM job_applications ja
      LEFT JOIN ai_evaluation_results aer ON ja.id = aer.application_id
      WHERE aer.id IS NULL AND ja.status = 'pending'
      ORDER BY ja.applied_date DESC
    `;

    const [rows] = await pool.query(query);

    res.json({
      success: true,
      message: `📋 Tìm thấy ${rows.length} applications chưa được đánh giá AI`,
      data: rows,
      pending_count: rows.length,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy pending applications:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách pending applications",
      error: error.message,
    });
  }
};

/**
 * Cập nhật status job application
 * PUT /api/job_applications/:id/status
 */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "reviewing",
      "interviewed",
      "hired",
      "rejected",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status không hợp lệ. Chọn: ${validStatuses.join(", ")}`,
      });
    }

    const [result] = await pool.query(
      "UPDATE job_applications SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy job application với ID = ${id}`,
      });
    }

    res.json({
      success: true,
      message: `✅ Đã cập nhật status thành '${status}' cho application ID = ${id}`,
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật status:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật status",
      error: error.message,
    });
  }
};
