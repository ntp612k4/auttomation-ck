import React, { useState, useEffect } from "react";
import { Send, Trash2, Mail } from "lucide-react";
import { fetchPassedApplicants } from "../services/api";
import InviteModal from "./modals/InviteModal";

const API_URL = "http://localhost:3001/api";

const TabPassedApplicants = () => {
  const [passedApplicants, setPassedApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mailData, setMailData] = useState({
    name: "",
    email: "",
    status: "pass",
    note: "",
    start_date: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchPassedApplicants();
      setPassedApplicants(data);
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  const handleApplicantSelect = (app) => {
    setSelectedApplicant(app);
    setMailData({
      name: app.full_name,
      email: app.email,
      status: "pass",
      note: "",
      start_date: "",
    });
  };

  const handleMailSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/send-mail-candidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mailData),
      });
      if (!response.ok) throw new Error("Lỗi");
      alert("Yêu cầu gửi mail đã chuyển hệ thống!");
      setSelectedApplicant(null);
    } catch (err) {
      alert(err.message);
    }
    setIsSubmitting(false);
  };

  const handleDeleteApplicant = async (id) => {
    if (!window.confirm("Chắc chắn xóa?")) return;
    try {
      await fetch(`${API_URL}/applicants_pass/${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Danh sách & Gửi mail cho Ứng viên Đạt
      </h3>
      <button
        onClick={() => setShowInviteModal(true)}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-purple-700"
      >
        <Send size={18} /> <span>Gửi mail phỏng vấn</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-lg">
          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border">Họ và tên</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Vị trí</th>
                  <th className="p-3 border">Xóa</th>
                </tr>
              </thead>
              <tbody>
                {passedApplicants.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => handleApplicantSelect(app)}
                    className={`border-t cursor-pointer ${
                      selectedApplicant?.id === app.id
                        ? "bg-blue-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-3 border">{app.full_name}</td>
                    <td className="p-3 border">{app.email}</td>
                    <td className="p-3 border">{app.position}</td>
                    <td className="p-3 border text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteApplicant(app.id);
                        }}
                        className="text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-lg">
          {selectedApplicant ? (
            <form onSubmit={handleMailSubmit} className="space-y-4">
              <h4 className="text-xl font-bold mb-4">Gửi mail Kết quả</h4>
              <div>
                <label className="block text-sm mb-1">Tên</label>
                <input
                  value={mailData.name}
                  disabled
                  className="w-full border bg-gray-100 p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  value={mailData.email}
                  disabled
                  className="w-full border bg-gray-100 p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Trạng thái</label>
                <select
                  className="w-full border p-2 rounded"
                  value={mailData.status}
                  onChange={(e) =>
                    setMailData({ ...mailData, status: e.target.value })
                  }
                >
                  <option value="pass">Đậu</option>
                  <option value="fail">Trượt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Ngày bắt đầu</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  value={mailData.start_date}
                  onChange={(e) =>
                    setMailData({ ...mailData, start_date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Ghi chú</label>
                <textarea
                  className="w-full border p-2 rounded h-24"
                  value={mailData.note}
                  onChange={(e) =>
                    setMailData({ ...mailData, note: e.target.value })
                  }
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex justify-center items-center gap-2"
              >
                <Mail size={18} /> Gửi
              </button>
            </form>
          ) : (
            <div className="text-center text-gray-500 pt-10">
              Vui lòng chọn ứng viên
            </div>
          )}
        </div>
      </div>

      {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
};
export default TabPassedApplicants;
