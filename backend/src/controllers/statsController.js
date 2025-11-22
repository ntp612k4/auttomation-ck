const pool = require("../config/database");

exports.getOverview = async (req, res) => {
  try {
    const [totalRes] = await pool.query(
      "SELECT COUNT(*) as total FROM employees WHERE status = 'ACTIVE'"
    );
    const totalEmployees = totalRes[0].total;

    const [urgencyRes] = await pool.query(
      "SELECT COUNT(DISTINCT employee_id) as total FROM survey_responses WHERE needs_attention = 1"
    );
    const highUrgencyCount = urgencyRes[0].total;

    const [deptRes] = await pool.query(
      "SELECT COUNT(*) AS total FROM departments"
    );
    const departmentStats = deptRes[0].total;

    const [perDeptRes] = await pool.query(`
      SELECT d.name, COUNT(e.id) as employeeCount
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'ACTIVE'
      GROUP BY d.id, d.name
    `);

    res.json({
      totalEmployees,
      highUrgencyCount,
      departmentStats,
      employeesPerDept: perDeptRes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAiIndex = async (req, res) => {
  // Giả lập route ai_index dựa trên logic client gọi (dù server cũ thiếu route này, mình mapping vào employee-analysis cho hợp logic hoặc trả về mảng rỗng nếu chưa có bảng)
  // Ở server cũ bạn có route /api/employee-analysis
  try {
    const [results] = await pool.query(
      "SELECT * FROM employee_analysis ORDER BY id DESC"
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu" });
  }
};
