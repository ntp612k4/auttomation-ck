const API_URL = "http://localhost:3001/api";

export const fetchDepartments = async () => {
  const res = await fetch(`${API_URL}/departments`, { credentials: "include" });
  return res.ok ? await res.json() : [];
};

export const fetchEmployees = async () => {
  const res = await fetch(`${API_URL}/employees`, { credentials: "include" });
  return res.ok ? await res.json() : [];
};

export const fetchDepartmentDetails = async () => {
  const res = await fetch(`${API_URL}/departments/details`, {
    credentials: "include",
  });
  return res.ok ? await res.json() : [];
};

export const fetchAiIndex = async () => {
  const res = await fetch(`${API_URL}/ai_index`); // or employee-analysis based on backend route
  return res.ok ? await res.json() : [];
};

// ✅ FIX: Hàm lấy ứng viên đã pass
export const fetchPassedApplicants = async () => {
  try {
    const response = await fetch(`${API_URL}/applicant-pass`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    // ✅ FIX: Xử lý response format
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
