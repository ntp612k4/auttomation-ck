import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

const EmployeeModal = ({ mode, employee, departments, onClose, onSave }) => {
  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    name: "",
    employee_code: "",
    email: "",
    department_id: "",
    position: "",
    join_date: "",
    status: "ACTIVE",
  });

  // Cập nhật form khi mở modal ở chế độ Edit
  useEffect(() => {
    if (mode === "edit" && employee) {
      setFormData({
        name: employee.name || "",
        employee_code: employee.employee_code || "",
        email: employee.email || "",
        department_id: employee.department_id || "",
        position: employee.position || "",
        join_date: employee.join_date ? employee.join_date.split("T")[0] : "", // Format date cho input type="date"
        status: employee.status || "ACTIVE",
      });
    } else {
      // Reset form khi mở chế độ Create
      setFormData({
        name: "",
        employee_code: "",
        email: "",
        department_id: "",
        position: "",
        join_date: "",
        status: "ACTIVE",
      });
    }
  }, [mode, employee]);

  // Hàm xử lý khi bấm nút Lưu
  const handleSubmit = () => {
    // Validate cơ bản
    if (
      !formData.name ||
      !formData.email ||
      !formData.employee_code ||
      !formData.department_id
    ) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }
    // Gửi dữ liệu ra ngoài cho component cha (TabEmployees) xử lý
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header Modal */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              {mode === "create" ? "Thêm nhân viên mới" : "Chỉnh sửa nhân viên"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã nhân viên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="EMP001"
              value={formData.employee_code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  employee_code: e.target.value,
                })
              }
              // Nếu là edit thì thường không cho sửa mã nhân viên, bạn có thể thêm disabled={mode === 'edit'} nếu muốn
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="email@company.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phòng ban <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.department_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  department_id: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn phòng ban --</option>
              {departments.map((dept) => (
                <option key={dept.department_id} value={dept.department_id}>
                  {dept.department_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chức vụ
            </label>
            <input
              type="text"
              placeholder="Developer, Manager..."
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày vào làm <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.join_date}
              onChange={(e) =>
                setFormData({ ...formData, join_date: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {mode === "edit" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">Đang làm việc</option>
                <option value="INACTIVE">Nghỉ việc</option>
                <option value="ON_LEAVE">Nghỉ phép</option>
              </select>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Save size={18} />
            <span>{mode === "create" ? "Thêm mới" : "Cập nhật"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
