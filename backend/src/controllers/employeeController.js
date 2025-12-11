const pool = require("../config/database");

// --- Departments ---
exports.getDepartments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id AS department_id, name AS department_name, code AS department_code, manager_name, manager_email, created_at FROM departments"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDepartmentDetails = async (req, res) => {
  try {
    const [departments] = await pool.query(
      "SELECT id AS department_id, name AS department_name FROM departments"
    );
    const [employees] = await pool.query(
      "SELECT e.id AS employee_id, e.name AS employee_name, e.department_id, e.satisfaction_score, e.stress_level, e.work_life_balance, e.burnout_risk FROM employees e"
    );

    const departmentDetails = departments.map((dept) => ({
      ...dept,
      employees: employees.filter(
        (emp) => emp.department_id === dept.department_id
      ),
    }));
    res.json(departmentDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Employees ---
exports.getEmployees = async (req, res) => {
  try {
    const { department_id } = req.query;
    let query = `SELECT e.*, d.name as department_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id`;
    const params = [];
    if (department_id && department_id !== "all") {
      query += " WHERE e.department_id = ?";
      params.push(department_id);
    }
    const [employees] = await pool.query(query, params);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { name, email, department_id, position, employee_code, join_date } =
      req.body;
    if (!name || !email || !department_id || !employee_code) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đủ các trường bắt buộc." });
    }
    const query =
      'INSERT INTO employees (name, email, department_id, position, employee_code, join_date, status) VALUES (?, ?, ?, ?, ?, ?, "ACTIVE")';
    const [result] = await pool.query(query, [
      name,
      email,
      department_id,
      position,
      employee_code,
      join_date,
    ]);
    res.status(201).json({ message: "Thêm thành công", id: result.insertId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY")
      return res
        .status(409)
        .json({ message: "Email hoặc Mã nhân viên đã tồn tại." });
    res.status(500).json({ error: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department_id, position, status } = req.body;
    const query =
      "UPDATE employees SET name = ?, email = ?, department_id = ?, position = ?, status = ? WHERE id = ?";
    await pool.query(query, [name, email, department_id, position, status, id]);
    res.json({ message: "Cập nhật thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM employees WHERE id = ?", [id]);
    res.json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addEmployeeAnalysis = async (req, res) => {
  // Route POST /api/employee-analysis
  try {
    const {
      rowNumber,
      employeeEmail,
      employeeName,
      diemCamXucAI,
      mucDoKietSuc,
      moiQuanNgaiChinh,
      deXuatTuAI,
      mucDoKhanCap,
      tomTatAI,
      thoiGianPhanTich,
      canChuY,
      priorityLevel,
    } = req.body;
    const sql = `INSERT INTO employee_analysis (rowNumber, employeeEmail, employeeName, diemCamXucAI, mucDoKietSuc, moiQuanNgaiChinh, deXuatTuAI, mucDoKhanCap, tomTatAI, thoiGianPhanTich, canChuY, priorityLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [
      rowNumber,
      employeeEmail,
      employeeName,
      diemCamXucAI,
      mucDoKietSuc,
      JSON.stringify(moiQuanNgaiChinh || []),
      JSON.stringify(deXuatTuAI || []),
      mucDoKhanCap,
      tomTatAI,
      new Date(thoiGianPhanTich),
      canChuY,
      priorityLevel,
    ]);
    res.json({ message: "✅✅ Đã lưu thành công", id: result.insertId });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Lỗi khi lưu dữ liệu", details: err.message });
  }
};

exports.getEmployeeAnalysis = async (req, res) => {
  // Route GET /api/employee-analysis
  try {
    const [results] = await pool.query(
      "SELECT * FROM employee_analysis ORDER BY id DESC"
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu" });
  }
};

// ✅ --- Survey Responses (SỬA: CHỈ CAO & THAP) ---

/**
 * ✅ Lưu kết quả khảo sát + AI phân tích từ N8N
 * POST /api/survey-responses
 *
 * Body:
 * {
 *   "employee_email": "phongnt.22it@vku.udn.vn",
 *   "employee_name": "Nguyễn Thanh Phong",
 *   "urgency_level": "CAO",
 *   "ai_summary": "..."
 * }
 */
exports.saveSurveyResponse = async (req, res) => {
  try {
    let { employee_email, employee_name, urgency_level, ai_summary } = req.body;

    // ✅ VALIDATION
    if (!employee_email || !employee_name) {
      return res.status(400).json({
        success: false,
        message: "Thiếu: employee_email, employee_name",
      });
    }

    // ✅ NORMALIZE urgency_level - CHỈ CAO & THAP
    const urgencyMap = {
      CAO: "CAO",
      cao: "CAO",
      THAP: "THAP",
      THẤP: "THAP",
      thap: "THAP",
      thấp: "THAP",
      KHONG_XAC_DINH: "KHONG_XAC_DINH",
      "Không xác định": "KHONG_XAC_DINH",
    };

    let finalUrgencyLevel =
      urgencyMap[urgency_level?.trim()] || "KHONG_XAC_DINH";

    console.log(
      `📥 Lưu survey: ${employee_name} (${employee_email}) - ${urgency_level}`
    );
    console.log(
      `   Input urgency: "${urgency_level}" → Output: "${finalUrgencyLevel}"`
    );

    // Lấy employee_id từ email
    const [employees] = await pool.query(
      "SELECT id FROM employees WHERE email = ? LIMIT 1",
      [employee_email]
    );

    let employee_id = null;
    if (employees.length > 0) {
      employee_id = employees[0].id;
      console.log(`✅ Tìm thấy employee ID: ${employee_id}`);
    } else {
      console.log(`⚠️ Không tìm thấy employee với email: ${employee_email}`);
    }

    // INSERT vào database
    const sql = `
      INSERT INTO survey_responses 
      (employee_id, employee_email, employee_name, urgency_level, ai_summary) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      employee_id,
      employee_email,
      employee_name,
      finalUrgencyLevel,
      ai_summary || "",
    ]);

    console.log(`✅ Đã lưu survey ID: ${result.insertId}`);

    res.status(201).json({
      success: true,
      message: `✅ Đã lưu khảo sát thành công`,
      id: result.insertId,
    });
  } catch (err) {
    console.error("❌ Lỗi:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lưu dữ liệu",
      details: err.message,
    });
  }
};

/**
 * ✅ Lấy dữ liệu khảo sát để hiển thị Tab Phòng Ban
 * GET /api/survey-responses
 * GET /api/survey-responses?urgency=CAO
 */
exports.getSurveyResponses = async (req, res) => {
  try {
    const { urgency } = req.query;

    let query = `
      SELECT 
        sr.id,
        sr.employee_email,
        sr.employee_name,
        sr.urgency_level,
        sr.ai_summary,
        sr.survey_date,
        e.position,
        d.name AS department_name
      FROM survey_responses sr
      LEFT JOIN employees e ON sr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;

    const params = [];

    if (urgency && urgency !== "all") {
      query += ` AND sr.urgency_level = ?`;
      params.push(urgency);
    }

    // ✅ SỬA: Chỉ CAO & THAP (xóa TRUNG_BINH)
    query += ` ORDER BY 
      CASE sr.urgency_level 
        WHEN 'CAO' THEN 1
        WHEN 'THAP' THEN 2
        ELSE 3
      END,
      sr.survey_date DESC`;

    const [results] = await pool.query(query, params);

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err) {
    console.error("❌ Lỗi:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/**
 * ✅ Thống kê mức độ khẩn cấp - CHỈ CAO & THAP
 * GET /api/survey-responses/stats
 */
exports.getSurveyStats = async (req, res) => {
  try {
    const sql = `
      SELECT 
        urgency_level,
        COUNT(*) as count
      FROM survey_responses
      GROUP BY urgency_level
      ORDER BY 
        CASE urgency_level
          WHEN 'CAO' THEN 1
          WHEN 'THAP' THEN 2
          ELSE 3
        END
    `;

    const [results] = await pool.query(sql);

    // ✅ SỬA: Chỉ CAO & THAP (xóa TRUNG_BINH)
    const stats = {
      CAO: results.find((r) => r.urgency_level === "CAO")?.count || 0,
      THAP: results.find((r) => r.urgency_level === "THAP")?.count || 0,
      total: results.reduce((sum, r) => sum + r.count, 0),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    console.error("❌ Lỗi:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
