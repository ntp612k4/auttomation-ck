const API_URL = "http://localhost:3001/api";

// ===== DEPARTMENTS =====
export const fetchDepartments = async () => {
  const res = await fetch(`${API_URL}/departments`, { credentials: "include" });
  return res.ok ? await res.json() : [];
};

export const fetchDepartmentDetails = async () => {
  const res = await fetch(`${API_URL}/departments/details`, {
    credentials: "include",
  });
  return res.ok ? await res.json() : [];
};

// ===== EMPLOYEES =====
export const fetchEmployees = async () => {
  const res = await fetch(`${API_URL}/employees`, { credentials: "include" });
  return res.ok ? await res.json() : [];
};

export const createEmployee = async (data) => {
  return fetch(`${API_URL}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
};

export const updateEmployee = async (id, data) => {
  return fetch(`${API_URL}/employees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
};

export const deleteEmployee = async (id) => {
  return fetch(`${API_URL}/employees/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
};

// ===== AI INDEX (CŨ) =====
export const fetchAiIndex = async () => {
  const res = await fetch(`${API_URL}/ai_index`);
  return res.ok ? await res.json() : [];
};

// ===== PASSED APPLICANTS =====
export const fetchPassedApplicants = async () => {
  try {
    const response = await fetch(`${API_URL}/applicant-pass`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.data)) {
      return data.data;
    } else if (data && Array.isArray(data.rows)) {
      return data.rows;
    }

    return [];
  } catch (error) {
    console.error("❌ Error fetching passed applicants:", error);
    throw error;
  }
};

export const deletePassedApplicant = async (id) => {
  try {
    const response = await fetch(`${API_URL}/applicant-pass/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Lỗi khi xóa ứng viên");
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error deleting applicant:", error);
    throw error;
  }
};

// ✅ ===== SURVEY RESPONSES (SỬA: CHỈ CAO & THAP) =====

export const fetchSurveyResponses = async (urgency = "all") => {
  try {
    const query = urgency === "all" ? "" : `?urgency=${urgency}`;
    const response = await fetch(`${API_URL}/survey-responses${query}`, {
      credentials: "include",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log("📊 Survey data:", data);
    return data.success ? data.data : [];
  } catch (error) {
    console.error("❌ Error:", error);
    return [];
  }
};

export const fetchSurveyStats = async () => {
  try {
    const response = await fetch(`${API_URL}/survey-responses/stats`, {
      credentials: "include",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log("📈 Survey stats:", data);
    return data.success ? data.data : { CAO: 0, THAP: 0, total: 0 };
  } catch (error) {
    console.error("❌ Error:", error);

    return { CAO: 0, THAP: 0, total: 0 };
  }
};

// ===== N8N WORKFLOW TRIGGERS =====
/**
 * ✅ Gọi webhook N8N để trigger workflow:
 * - CAO: Gửi email hướng dẫn theo dõi sức khỏe
 * - THAP: Gửi email cảm ơn
 */
export const triggerHealthGuidanceWorkflow = async (survey) => {
  try {
    const n8nWebhookUrl = "http://localhost:5678/webhook/health-guidance";

    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_email: survey.employee_email,
        employee_name: survey.employee_name,
        urgency_level: survey.urgency_level,
        ai_summary: survey.ai_summary,
        survey_date: survey.survey_date,
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log("✅ N8N workflow triggered:", data);
    return { success: true, message: "Workflow triggered successfully" };
  } catch (error) {
    console.error("❌ Error triggering N8N workflow:", error);
    return {
      success: false,
      message: error.message || "Failed to trigger workflow",
    };
  }
};
