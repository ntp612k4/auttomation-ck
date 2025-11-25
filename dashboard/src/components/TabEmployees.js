import React, { useState } from "react";
import { Plus, Edit2, Trash2, ClipboardList, Star } from "lucide-react";
import EmployeeModal from "./modals/EmployeeModal";
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../services/api";

const API_URL = "http://localhost:3001/api";

const TabEmployees = ({ employees, departments, refreshData, loading }) => {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isTriggeringSurvey, setIsTriggeringSurvey] = useState(false);
  const [isTriggingEvaluation, setIsTriggingEvaluation] = useState(false);

  const openCreateModal = () => {
    setModalMode("create");
    setCurrentEmployee(null);
    setShowModal(true);
  };

  const openEditModal = (employee) => {
    setModalMode("edit");
    setCurrentEmployee(employee);
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhân viên "${name}"?`)) return;
    try {
      const res = await deleteEmployee(id);
      if (res.ok) {
        refreshData();
        alert("Đã xóa nhân viên!");
      } else alert("Lỗi khi xóa!");
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      alert("Lỗi kết nối!");
    }
  };

  const handleSave = async (data) => {
    try {
      let res;
      if (modalMode === "create") {
        res = await createEmployee(data);
      } else {
        res = await updateEmployee(currentEmployee.id, data);
      }
      if (res.ok) {
        refreshData();
        setShowModal(false);
        alert(
          modalMode === "create" ? "Thêm thành công!" : "Cập nhật thành công!"
        );
      } else {
        alert("Có lỗi xảy ra!");
      }
    } catch (e) {
      console.error("Lỗi khi lưu:", e);
      alert("Lỗi kết nối!");
    }
  };

  // Hàm kích hoạt đánh giá ứng viên
  const handleTriggerEvaluation = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn bắt đầu quy trình đánh giá ứng viên không?"
      )
    ) {
      return;
    }

    setIsTriggingEvaluation(true);
    try {
      const response = await fetch(`${API_URL}/trigger-evaluation`, {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Có lỗi xảy ra.");
      }

      alert("✅ Đã gửi yêu cầu đánh giá ứng viên thành công!");
    } catch (error) {
      console.error("Lỗi khi kích hoạt đánh giá:", error);
      alert(`❌ Lỗi: ${error.message}`);
    } finally {
      setIsTriggingEvaluation(false);
    }
  };

  // Hàm kích hoạt khảo sát nhân viên
  const handleTriggerSurvey = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn bắt đầu quy trình khảo sát nhân viên không?"
      )
    ) {
      return;
    }

    setIsTriggeringSurvey(true);
    try {
      const response = await fetch(`${API_URL}/trigger-survey`, {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Có lỗi xảy ra.");
      }

      alert("✅ Đã gửi yêu cầu khảo sát nhân viên thành công!");
    } catch (error) {
      console.error("Lỗi khi kích hoạt khảo sát:", error);
      alert(`❌ Lỗi: ${error.message}`);
    } finally {
      setIsTriggeringSurvey(false);
    }
  };

  // Hàm lấy tên phòng ban từ ID
  const getDepartmentName = (deptId) => {
    const dept = departments.find(
      (d) => d.department_id === deptId || d.id === deptId
    );
    return dept ? dept.department_name || dept.name : "-";
  };

  const filteredEmployees =
    selectedDepartment === "all"
      ? employees
      : employees.filter(
          (emp) => emp.department_id === parseInt(selectedDepartment)
        );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            Danh sách nhân viên
          </h3>

          {/* CONTAINER CHO 3 NÚT */}
          <div className="flex gap-3">
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
              <span className="font-medium">Thêm nhân viên</span>
            </button>

            <button
              onClick={handleTriggerEvaluation}
              disabled={isTriggingEvaluation}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-purple-700 transition-colors shadow-sm disabled:bg-purple-400 disabled:cursor-not-allowed"
            >
              <Star size={20} />
              <span className="font-medium">
                {isTriggingEvaluation ? "Đang xử lý..." : "Đánh giá"}
              </span>
            </button>

            <button
              onClick={handleTriggerSurvey}
              disabled={isTriggeringSurvey}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors shadow-sm disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              <ClipboardList size={20} />
              <span className="font-medium">
                {isTriggeringSurvey ? "Đang xử lý..." : "Khảo sát nhân viên"}
              </span>
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <select
            className="border border-gray-300 rounded-md px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="all">Tất cả phòng ban</option>
            {departments.map((dept) => (
              <option
                key={dept.department_id || dept.id}
                value={dept.department_id || dept.id}
              >
                {dept.department_name || dept.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Đang tải...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Không có nhân viên nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nhân viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phòng ban
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Chức vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {emp.name}
                        </div>
                        <div className="text-sm text-gray-500">{emp.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {getDepartmentName(emp.department_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {emp.position || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          emp.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {emp.status === "ACTIVE" ? "Đang làm" : "Nghỉ việc"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id, emp.name)}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && (
        <EmployeeModal
          mode={modalMode}
          employee={currentEmployee}
          departments={departments}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default TabEmployees;
