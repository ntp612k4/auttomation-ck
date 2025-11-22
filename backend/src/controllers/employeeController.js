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
