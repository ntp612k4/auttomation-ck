import React, { useState, useEffect } from "react";
// ✅ THÊM: Import icon UserCheck
import { Send, Trash2, Mail, Rocket, UserCheck } from "lucide-react";
import { fetchPassedApplicants, deletePassedApplicant } from "../services/api";
import InviteScheduleModal from "./modals/InviteScheduleModal";

const API_URL = "http://localhost:3001/api";

const TabPassedApplicants = () => {
  const [passedApplicants, setPassedApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [mailData, setMailData] = useState({
    name: "",
    email: "",
    position: "",
    status: "pass",
    note: "",
  });

  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardData, setOnboardData] = useState(null);

  // ✅ THÊM: State mới để track khi tiếp nhận nhân viên
  const [isAcceptingEmployee, setIsAcceptingEmployee] = useState(false);

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
   */
  const handleApplicantSelect = (app) => {
    console.log("Selected applicant:", app);
    setSelectedApplicant(app);
    setMailData({
      name: app.name || "",
      email: app.email || "",
      position: app.position || "",
      status: "pass",
      note: "",
    });
  };

  /**
   * ✅ HANDLE MAIL SUBMIT: Gửi mail kết quả cho 1 ứng viên
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
        name: mailData.name,
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
        name: "",
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

  /**
   * ✅ HÀM MỚI: Xử lý tiếp nhận ứng viên làm nhân viên chính thức
   */
  const handleAcceptEmployee = async (applicant) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn tiếp nhận ${applicant.name} làm nhân viên chính thức?`
      )
    ) {
      return;
    }

    setIsAcceptingEmployee(true);
    try {
      console.log("📤 Accepting employee:", applicant.id);

      const response = await fetch(`${API_URL}/onboarding/accept-employee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicant_id: applicant.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Thất bại");
      }

      alert(`✅ Đã tiếp nhận ${applicant.name} làm nhân viên chính thức!`);

      // Reload danh sách để cập nhật
      loadData();
    } catch (error) {
      console.error("❌ Lỗi khi tiếp nhận nhân viên:", error);
      alert("Lỗi: " + error.message);
    } finally {
      setIsAcceptingEmployee(false);
    }
  };

  // ✅ Các hàm xử lý cho chức năng Onboarding
  const openOnboardModal = (applicant) => {
    setOnboardData({
      applicant: applicant,
      start_date: "",
      document_link: "",
    });
    setShowOnboardModal(true);
  };

  const handleOnboardDataChange = (e) => {
    const { name, value } = e.target;
    setOnboardData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!onboardData.start_date) {
      alert("Vui lòng chọn ngày bắt đầu làm việc.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/onboarding/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicant_id: onboardData.applicant.id,
          start_date: onboardData.start_date,
          document_link: onboardData.document_link,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Thất bại");
      alert("✅ Email chào mừng đã được gửi thành công!");
      setShowOnboardModal(false);
      loadData();
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setIsSubmitting(false);
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

      {/* ✅ BUTTON HÀNG LOẠT */}
      <button
        onClick={() => setShowInviteModal(true)}
        disabled={passedApplicants.length === 0 || loading}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-purple-700 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={18} />
        <span>Gửi mail phỏng vấn ({passedApplicants.length})</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* ✅ DANH SÁCH ỨNG VIÊN */}
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
                          {app.name}
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
                        {/* ✅ CẬP NHẬT: Thêm 3 nút Rocket, UserCheck, Trash */}
                        <div className="flex items-center justify-center space-x-2">
                          {/* Nút 1: Rocket (🚀) - Gửi Welcome Email */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openOnboardModal(app);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"
                            title="Gửi Welcome Email"
                            disabled={isAcceptingEmployee}
                          >
                            <Rocket size={16} />
                          </button>

                          {/* ✅ NÚT MỚI 2: UserCheck (✅) - Tiếp Nhận Làm Nhân Viên */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptEmployee(app);
                            }}
                            disabled={isAcceptingEmployee}
                            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100 disabled:opacity-50 transition-colors"
                            title="Tiếp nhận làm nhân viên chính thức"
                          >
                            <UserCheck size={16} />
                          </button>

                          {/* Nút 3: Trash (🗑️) - Xóa Ứng Viên */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteApplicant(app.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                            title="Xóa ứng viên"
                            disabled={isAcceptingEmployee}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ✅ FORM GỬI MAIL KỈ QUẢ */}
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

      {/* ✅ MODAL GỬI MAIL PHỎNG VẤN HÀNG LOẠT */}
      <InviteScheduleModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        passedApplicants={passedApplicants}
      />

      {/* ✅ MODAL ONBOARDING */}
      {showOnboardModal && onboardData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-2xl transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                <Rocket /> Onboarding Nhân Viên Mới
              </h4>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleOnboardSubmit}>
              <div className="mb-4">
                <label className="block text-sm text-gray-600">
                  Nhân viên:
                </label>
                <input
                  value={onboardData.applicant.name}
                  disabled
                  className="w-full border p-2 bg-gray-100 rounded mt-1"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-600">Email:</label>
                <input
                  value={onboardData.applicant.email}
                  disabled
                  className="w-full border p-2 bg-gray-100 rounded mt-1"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-600">
                  Link tài liệu (Sổ tay, Quy định...) — tùy chọn
                </label>
                <input
                  type="url"
                  name="document_link"
                  placeholder="https://..."
                  value={onboardData.document_link}
                  onChange={handleOnboardDataChange}
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Ngày bắt đầu làm việc:
                </label>
                <input
                  type="date"
                  name="start_date"
                  required
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500"
                  value={onboardData.start_date}
                  onChange={handleOnboardDataChange}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 disabled:bg-blue-400 transition-colors"
                >
                  {isSubmitting ? "Đang xử lý..." : "Gửi Welcome Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabPassedApplicants;
