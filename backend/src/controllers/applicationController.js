const pool = require("../config/database");

exports.createApplication = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      position,
      education,
      language_cert,
      years_experience,
      professional_skills,
      strengths,
      motivation,
    } = req.body;
    if (!full_name || !email || !position)
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc!" });

    const query = `INSERT INTO job_applications (full_name, email, phone, position, education, language_cert, years_experience, professional_skills, strengths, motivation, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    const [result] = await pool.query(query, [
      full_name,
      email,
      phone,
      position,
      education,
      language_cert,
      years_experience,
      professional_skills,
      strengths,
      motivation,
    ]);
    res.status(201).json({
      message: "Ứng viên đã được lưu thành công!",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, full_name, email, phone, position, education, language_cert, years_experience, professional_skills, strengths, motivation, created_at FROM job_applications ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách ứng viên",
      error: error.message,
    });
  }
};

exports.updateAiResult = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ai_overall_score,
      ai_reasoning,
      educationScore,
      experienceScore,
      skillsScore,
      motivationScore,
      ai_recommendation,
      languageScore,
      strengths,
      concerns,
      interviewTopics,
      isPassed,
    } = req.body;
    const query = `UPDATE job_applications SET ai_overall_score = ?, ai_reasoning = ?, educationScore = ?, experienceScore = ?, skillsScore = ?, motivationScore = ?, ai_recommendation = ?, languageScore = ?, strengths = ?, concerns = ?, interviewTopics = ?, isPassed = ? WHERE id = ?`;
    const values = [
      ai_overall_score,
      ai_reasoning,
      educationScore,
      experienceScore,
      skillsScore,
      motivationScore,
      ai_recommendation,
      languageScore,
      strengths,
      concerns,
      interviewTopics,
      isPassed,
      id,
    ];
    const [result] = await pool.query(query, values);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ message: `Không tìm thấy ứng viên với ID = ${id}` });
    res
      .status(200)
      .json({ message: `✅ Đã cập nhật thành công ứng viên ID = ${id}` });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// --- Applicants Pass ---
exports.createPassApplicant = async (req, res) => {
  try {
    const {
      id,
      full_name,
      email,
      phone,
      position,
      education,
      language_cert,
      years_experience,
      professional_skills,
      strengths,
      motivation,
      ai_overall_score,
      ai_recommendation,
      ai_reasoning,
      status,
      concerns,
      interviewTopics,
      isPassed,
      educationScore,
      languageScore,
      experienceScore,
      skillsScore,
      motivationScore,
      created_at,
    } = req.body;
    if (!full_name || !email || !position)
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc!" });

    const query = `INSERT INTO applicants_pass (id, full_name, email, phone, position, education, language_cert, years_experience, professional_skills, strengths, motivation, ai_overall_score, ai_recommendation, ai_reasoning, status, concerns, interviewTopics, isPassed, educationScore, languageScore, experienceScore, skillsScore, motivationScore, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(query, [
      id,
      full_name,
      email,
      phone,
      position,
      education,
      language_cert,
      years_experience,
      professional_skills,
      strengths,
      motivation,
      ai_overall_score,
      ai_recommendation,
      ai_reasoning,
      status || "NEW",
      concerns,
      interviewTopics,
      isPassed,
      educationScore,
      languageScore,
      experienceScore,
      skillsScore,
      motivationScore,
      created_at || new Date(),
    ]);
    res.status(201).json({
      message: "Ứng viên đạt phỏng vấn đã được lưu vào bảng applicants_pass!",
      id: result.insertId,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi máy chủ khi lưu ứng viên!", error: error.message });
  }
};

exports.getPassApplicants = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM applicants_pass ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.deletePassApplicant = async (req, res) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM applicants_pass WHERE id = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy" });
    res.json({ message: "Đã xóa" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
