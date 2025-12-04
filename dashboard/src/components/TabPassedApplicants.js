import React, { useState, useEffect } from "react";
import { Send, Trash2, Mail } from "lucide-react";
import { fetchPassedApplicants, deletePassedApplicant } from "../services/api";
// ✅ IMPORT: Modal gửi mail phỏng vấn hàng loạt
import InviteScheduleModal from "./modals/InviteScheduleModal";

const API_URL = "http://localhost:3001/api";

const TabPassedApplicants = () => {
  const [passedApplicants, setPassedApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ NEW STATE: Quản lý modal gửi mail phỏng vấn hàng loạt
  const [showInviteModal, setShowInviteModal] = useState(false);

  // ✅ STATE: Dữ liệu form gửi mail kết quả từng người (GIỮ NGUYÊN)
  const [mailData, setMailData] = useState({
    full_name: "",
    email: "",
    position: "",
    status: "pass",
    note: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  /**
   * ✅ LOAD DATA: Lấy danh sách ứng viên đã pass từ API
   */
  const loadData = async () => {
    setLoading(true);
    try {
      console.log("📥 Loading passed applicants...");
      const data = await fetchPassedApplicants();

      console.log("✅ Fetched data:", data);
      console.log("✅ Data length:", data?.length);

      if (Array.isArray(data)) {
        setPassedApplicants(data);
      } else {
        console.warn("⚠️ Data is not an array:", data);
        setPassedApplicants([]);
      }
    } catch (error) {
      console.error("❌ Failed to load passed applicants:", error);
      setPassedApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ HANDLE APPLICANT SELECT: Chọn ứng viên để gửi mail kết quả
   * (GIỮ NGUYÊN - dùng cho chức năng gửi mail kết quả từng người)
   */
  const handleApplicantSelect = (app) => {
    console.log("Selected applicant:", app);
    setSelectedApplicant(app);
    setMailData({
      full_name: app.full_name || "",
      email: app.email || "",
      position: app.position || "",
      status: "pass",
      note: "",
    });
  };

  /**
   * ✅ HANDLE MAIL SUBMIT: Gửi mail kết quả cho 1 ứng viên
   * (GIỮ NGUYÊN - chức năng cũ)
   */
  const handleMailSubmit = async (e) => {
    e.preventDefault();

    if (!selectedApplicant) {
      alert("❌ Vui lòng chọn ứng viên");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        full_name: mailData.full_name,
        email: mailData.email,
        position: mailData.position,
        status: mailData.status,
        interview_result: mailData.status === "pass" ? "passed" : "failed",
        note: mailData.note,
      };

      console.log("📤 Sending mail with payload:", payload);

      const response = await fetch(`${API_URL}/send-mail-candidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error response:", errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Mail sent successfully:", result);

      alert("✅ Yêu cầu gửi mail đã được chuyển đến hệ thống!");
      setSelectedApplicant(null);
      setMailData({
        full_name: "",
        email: "",
        position: "",
        status: "pass",
        note: "",
      });
      await loadData();
    } catch (err) {
      console.error("❌ Error sending mail:", err);
      alert("❌ Lỗi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * ✅ HANDLE DELETE: Xóa ứng viên khỏi danh sách
   * (GIỮ NGUYÊN)
   */
  const handleDeleteApplicant = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ứng viên này?")) return;

    try {
      console.log("🗑️ Deleting applicant:", id);
      await deletePassedApplicant(id);

      alert("✅ Đã xóa ứng viên thành công.");
      setSelectedApplicant(null);
      await loadData();
    } catch (err) {
      console.error("❌ Error deleting applicant:", err);
      alert("❌ Lỗi: " + err.message);
    }
  };

  // ✅ LOADING SPINNER
  const LoadingSpinner = () => (
    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
  );

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Danh sách & Gửi mail cho Ứng viên Đạt
      </h3>

      {/* ✅ BUTTON HÀNG LOẠT: Đổi từ "Tải lại dữ liệu" → "Gửi mail phỏng vấn" */}
      <button
        onClick={() => setShowInviteModal(true)}
        disabled={passedApplicants.length === 0 || loading}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-purple-700 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={18} />
        <span>Gửi mail phỏng vấn ({passedApplicants.length})</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* ✅ DANH SÁCH ỨNG VIÊN (GIỮ NGUYÊN) */}
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-md">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoadingSpinner />
              <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          ) : passedApplicants.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>❌ Chưa có ứng viên nào pass</p>
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
                          {Number(app.ai_overall_score)?.toFixed(2) || "N/A"}
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

        {/* ✅ FORM GỬI MAIL KỈ QUẢ (GIỮ NGUYÊN - chức năng cũ) */}
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
                  value={mailData.full_name}
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
                  value={mailData.position}
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
                  <option value="pass">✅ Đậu</option>
                  <option value="fail">❌ Trượt</option>
                </select>
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
              <p className="mb-2">👆 Vui lòng chọn ứng viên từ danh sách</p>
              <p className="text-sm text-gray-400">
                Nhấp vào một hàng trong bảng để xem chi tiết
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ MODAL GỬI MAIL PHỎNG VẤN HÀNG LOẠT (NEW) */}
      <InviteScheduleModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        passedApplicants={passedApplicants}
      />
    </div>
  );
};

export default TabPassedApplicants;
