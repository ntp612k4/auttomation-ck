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

export const fetchPassedApplicants = async () => {
  const res = await fetch(`${API_URL}/applicants_pass_dat`);
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
