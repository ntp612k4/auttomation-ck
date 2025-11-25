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

const API_BASE_URL = "http://localhost:3001/api";

export const fetchPassedApplicants = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/applicant-pass`);
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }
    const result = await response.json();
    // API của bạn trả về { success, count, data }, nên chúng ta cần lấy `result.data`
    return result.data || [];
  } catch (error) {
    console.error("Lỗi khi tải danh sách ứng viên pass:", error);
    // Ném lỗi ra ngoài để component có thể xử lý
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
  // ... logic xóa
  try {
    const response = await fetch(`${API_BASE_URL}/applicant-pass/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Không thể xóa ứng viên.");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi khi xóa ứng viên:", error);
    throw error;
  }
};
