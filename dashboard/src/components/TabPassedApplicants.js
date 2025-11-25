import React, { useState, useEffect } from "react";
import { Send, Trash2, Mail } from "lucide-react"; // Bỏ LoaderCircle
import { fetchPassedApplicants, deletePassedApplicant } from "../services/api";

const API_URL = "http://localhost:3001/api";

const TabPassedApplicants = ({ onShowInviteModal }) => {
  const [passedApplicants, setPassedApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mailData, setMailData] = useState({
    name: "",
    email: "",
    position: "", // Thêm trường position
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
      console.log("Loaded passed applicants:", data);
      setPassedApplicants(data || []);
    } catch (error) {
      console.error("Failed to load passed applicants:", error);
      setPassedApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicantSelect = (app) => {
    setSelectedApplicant(app);
    setMailData({
      name: app.full_name,
      email: app.email,
      position: app.position, // Lấy position từ ứng viên được chọn
      status: "pass",
      note: "",
      start_date: "",
    });
  };

  const handleMailSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApplicant) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/send-mail-candidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mailData),
      });
      if (!response.ok) throw new Error("Lỗi khi gửi mail");
      alert("Yêu cầu gửi mail đã được chuyển đến hệ thống!");
      setSelectedApplicant(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteApplicant = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ứng viên này?")) return;
    try {
      await deletePassedApplicant(id);
      alert("Đã xóa ứng viên thành công.");
      loadData();
      if (selectedApplicant?.id === id) {
        setSelectedApplicant(null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Custom loading spinner component
  const LoadingSpinner = () => (
    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
  );

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Danh sách & Gửi mail cho Ứng viên Đạt
      </h3>

      {onShowInviteModal && (
        <button
          onClick={onShowInviteModal}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-purple-700 transition-colors mb-4"
        >
          <Send size={18} />
          <span>Gửi mail phỏng vấn</span>
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Applicant List */}
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-md">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoadingSpinner />
              <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          ) : passedApplicants.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Chưa có ứng viên nào pass</p>
              <button
                onClick={loadData}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Tải lại
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">
                      Họ và tên
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">
                      Vị trí
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-gray-600 border-b">
                      Điểm AI
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-gray-600 border-b">
                      Kết quả
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-gray-600 border-b">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {passedApplicants.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => handleApplicantSelect(app)}
                      className={`border-t cursor-pointer transition-colors ${
                        selectedApplicant?.id === app.id
                          ? "bg-purple-100"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-medium text-gray-800">
                          {app.full_name}
                        </div>
                        <div className="text-xs text-gray-500">{app.email}</div>
                      </td>
                      <td className="p-3 text-gray-700">{app.position}</td>
                      <td className="p-3 text-center">
                        <span className="font-semibold text-green-600">
                          {app.ai_overall_score}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                          {app.ai_recommendation || "ĐẠT"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteApplicant(app.id);
                          }}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                          title="Xóa ứng viên"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Details & Mail Form */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md">
          {selectedApplicant ? (
            <form onSubmit={handleMailSubmit} className="space-y-4">
              <h4 className="text-xl font-bold text-gray-800 mb-4">
                Gửi mail Kết quả
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Họ và tên
                </label>
                <input
                  value={mailData.name}
                  disabled
                  className="w-full border bg-gray-100 p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input
                  value={mailData.email}
                  disabled
                  className="w-full border bg-gray-100 p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Vị trí ứng tuyển
                </label>
                <input
                  value={selectedApplicant.position}
                  disabled
                  className="w-full border bg-gray-100 p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Điểm AI đánh giá
                </label>
                <input
                  value={`${selectedApplicant.ai_overall_score}/100 - ${
                    selectedApplicant.ai_recommendation || "ĐẠT"
                  }`}
                  disabled
                  className="w-full border bg-gray-100 p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Trạng thái
                </label>
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
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Ngày phỏng vấn
                </label>
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
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Ghi chú thêm
                </label>
                <textarea
                  className="w-full border p-2 rounded h-24"
                  value={mailData.note}
                  onChange={(e) =>
                    setMailData({ ...mailData, note: e.target.value })
                  }
                  placeholder="Thêm ghi chú cho ứng viên..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex justify-center items-center gap-2 disabled:bg-blue-400 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    <span>Gửi mail</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-8">
              <p className="mb-2">Vui lòng chọn ứng viên từ danh sách</p>
              <p className="text-sm text-gray-400">
                Nhấp vào một hàng trong bảng để xem chi tiết
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabPassedApplicants;
