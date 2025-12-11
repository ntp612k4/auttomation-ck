const pool = require("../config/database");
const axios = require("axios");

/**
 * ✅ HÀM HELPER: Lấy department_id dựa trên position
 * Mapping vị trí công việc với phòng ban
 */
const getDepartmentIdByPosition = (position) => {
  if (!position) return 4; // Mặc định: HR (id=4)

  const positionLower = position.toLowerCase().trim();

  // IT Department (id=1)
  if (
    positionLower.includes("developer") ||
    positionLower.includes("devops") ||
    positionLower.includes("qa") ||
    positionLower.includes("system") ||
    positionLower.includes("admin") ||
    positionLower.includes("engineer")
  ) {
    return 1;
  }

  // Sales Department (id=2)
  if (
    positionLower.includes("sales") ||
    positionLower.includes("account executive")
  ) {
    return 2;
  }

  // Marketing Department (id=3)
  if (
    positionLower.includes("marketing") ||
    positionLower.includes("content") ||
    positionLower.includes("mkt")
  ) {
    return 3;
  }

  // HR Department (id=4)
  if (
    positionLower.includes("hr") ||
    positionLower.includes("recruiter") ||
    positionLower.includes("human resource")
  ) {
    return 4;
  }

  // Design Department (id=5)
  if (
    positionLower.includes("design") ||
    positionLower.includes("ui") ||
    positionLower.includes("ux")
  ) {
    return 5;
  }

  // Mặc định: HR (id=4)
  return 4;
};

/**
 * ✅ Gửi email chào mừng và thông báo ngày bắt đầu làm việc cho ứng viên
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
      name: applicant.name,
      email: applicant.email,
      position: applicant.position,
      start_date: start_date,
      document_link: document_link || "",
    });

    res.status(200).json({
      success: true,
      message: `✅ Đã gửi email chào mừng tới ${applicant.name} thành công!`,
    });
  } catch (error) {
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

/**
 * ✅ HÀM MỚI: Chuyển ứng viên thành nhân viên chính thức
 * POST /api/onboarding/accept-employee
 *
 * ✅ CẬP NHẬT: Tự động gán department_id dựa trên position
 */
exports.acceptEmployeeProcess = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { applicant_id } = req.body;

    if (!applicant_id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: applicant_id",
      });
    }

    console.log(`📥 Processing applicant ID: ${applicant_id}`);

    await connection.beginTransaction();

    // 1️⃣ Lấy thông tin ứng viên từ applicant_pass
    const [applicants] = await connection.query(
      "SELECT id, name, email, position FROM applicant_pass WHERE id = ?",
      [applicant_id]
    );

    if (applicants.length === 0) {
      await connection.rollback();
      console.log(`❌ Applicant not found: ID ${applicant_id}`);
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy ứng viên với ID = ${applicant_id}`,
      });
    }

    const applicant = applicants[0];
    console.log(`✅ Found applicant:`, {
      id: applicant.id,
      name: applicant.name,
      email: applicant.email,
      position: applicant.position,
    });

    // 2️⃣ ✅ TẠO MÃ NHÂN VIÊN TỰ ĐỘNG
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-CA").replace(/-/g, "");

    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");

    const employeeCode = `EMP${dateStr}${randomNum}`;

    console.log(`✅ Generated employee_code: ${employeeCode}`);

    // 3️⃣ ✅ TỰ ĐỘNG GÁN DEPARTMENT dựa trên position
    const departmentId = getDepartmentIdByPosition(applicant.position);
    console.log(
      `✅ Auto-assigned department_id: ${departmentId} for position: ${applicant.position}`
    );

    // 4️⃣ Chèn vào bảng employees
    const employeeQuery = `
      INSERT INTO employees 
      (employee_code, name, email, position, department_id, status, join_date)
      VALUES (?, ?, ?, ?, ?, 'ACTIVE', NOW())
    `;

    const [employeeResult] = await connection.query(employeeQuery, [
      employeeCode,
      applicant.name,
      applicant.email,
      applicant.position,
      departmentId, // ✅ Tự động gán
    ]);

    const newEmployeeId = employeeResult.insertId;
    console.log(
      `✅ Created employee ID: ${newEmployeeId}, employee_code: ${employeeCode}, department_id: ${departmentId}`
    );

    // 5️⃣ Xóa khỏi bảng applicant_pass
    await connection.query("DELETE FROM applicant_pass WHERE id = ?", [
      applicant_id,
    ]);
    console.log(`✅ Deleted applicant ID: ${applicant_id} from applicant_pass`);

    await connection.commit();

    console.log(`✅ Transaction committed successfully`);

    // ✅ Lấy thông tin phòng ban vừa gán
    const [departments] = await connection.query(
      "SELECT id, name, code FROM departments WHERE id = ?",
      [departmentId]
    );
    const department = departments.length > 0 ? departments[0] : null;

    res.status(200).json({
      success: true,
      message: `✅ Đã tiếp nhận ${applicant.name} làm nhân viên chính thức!`,
      data: {
        new_employee_id: newEmployeeId,
        employee_code: employeeCode,
        employee_name: applicant.name,
        employee_email: applicant.email,
        employee_position: applicant.position,
        department_id: departmentId,
        department_name: department?.name || "N/A",
        join_date: new Date().toISOString().split("T")[0],
      },
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Lỗi khi tiếp nhận nhân viên:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi tiếp nhận nhân viên",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};
