import React, { useState, useEffect } from "react";
import { Calendar, Clock, Send, X } from "lucide-react";

const API_URL = "http://localhost:3001/api";

/**
 * ✅ MODAL GỬI MAIL PHỎNG VẤN HÀNG LOẠT
 * Hiển thị form nhập ngày/giờ + danh sách tất cả candidates
 * Gửi toàn bộ thông tin tới N8N webhook
 */
const InviteScheduleModal = ({ isOpen, onClose, passedApplicants = [] }) => {
  // ✅ State quản lý form
  const [formData, setFormData] = useState({
    interview_date: "", // Ngày phỏng vấn (YYYY-MM-DD)
    interview_time: "", // Giờ phỏng vấn (HH:MM)
  });

  // ✅ State quản lý submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Reset form khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        interview_date: "",
        interview_time: "",
      });
      setIsSubmitting(false);
    }
  }, [isOpen]);

  /**
   * ✅ HANDLE CHANGE: Cập nhật form data
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(`📝 Updated ${name}: ${value}`);
  };

  /**
   * ✅ HANDLE SUBMIT: Gửi mail phỏng vấn hàng loạt
   * 1. Validate input
   * 2. Build payload (candidates + ngày/giờ)
   * 3. Call API /send-interview-invites
   * 4. N8N nhận webhook → gửi mail cho từng người
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation: Kiểm tra ngày/giờ
    if (!formData.interview_date || !formData.interview_time) {
      alert("❌ Vui lòng nhập đầy đủ ngày và giờ phỏng vấn");
      return;
    }

    // ✅ Validation: Kiểm tra danh sách candidates
    if (!Array.isArray(passedApplicants) || passedApplicants.length === 0) {
      alert("❌ Không có ứng viên để gửi");
      return;
    }

    // ✅ Validation: Filter candidates hợp lệ (có email + tên)
    const validCandidates = passedApplicants
      .filter((c) => c.email && c.full_name)
      .map((c) => ({
        full_name: c.full_name,
        email: c.email,
        position: c.position || "N/A",
        ai_overall_score: c.ai_overall_score || 0,
      }));

    if (validCandidates.length === 0) {
      alert("❌ Không có ứng viên hợp lệ");
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ BUILD PAYLOAD: Toàn bộ thông tin gửi tới N8N
      const payload = {
        interview_date: formData.interview_date, // "2025-12-05"
        interview_time: formData.interview_time, // "09:00"
        candidates: validCandidates, // Array của candidates
        total_count: validCandidates.length,
        timestamp: new Date().toISOString(),
      };

      console.log(
        "📤 Payload to send-interview-invites:",
        JSON.stringify(payload, null, 2)
      );

      // ✅ CALL API: Gửi request tới Backend
      const response = await fetch(`${API_URL}/send-interview-invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        timeout: 120000, // 2 minutes timeout
      });

      // ✅ ERROR HANDLING: Check response
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API Error response:", errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Success response from API:", result);

      // ✅ SUCCESS: Hiển thị message + close modal
      alert(`✅ Đã gửi lịch phỏng vấn cho ${validCandidates.length} ứng viên!`);
      setFormData({
        interview_date: "",
        interview_time: "",
      });
      onClose(); // Close modal
    } catch (error) {
      console.error("❌ Error sending interview invites:", error);

      // ✅ TIMEOUT ERROR: Specific handling
      if (error.message.includes("timeout")) {
        alert("❌ Timeout: Server đang xử lý, vui lòng chờ...");
      } else {
        alert(`❌ Lỗi: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ RETURN NULL: Nếu modal không open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-96 overflow-y-auto">
        {/* ✅ HEADER: Tiêu đề modal */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            📨 Gửi Lịch Phỏng Vấn Hàng Loạt
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            title="Đóng modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* ✅ DANH SÁCH CANDIDATES: Hiển thị tất cả người sẽ nhận mail */}
        <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
          <p className="font-semibold text-sm text-gray-800 mb-2">
            📋 {passedApplicants.length} ứng viên sẽ nhận lịch phỏng vấn:
          </p>
          <div className="max-h-32 overflow-y-auto">
            <ul className="text-xs space-y-1">
              {passedApplicants.map((candidate, idx) => (
                <li key={idx} className="text-gray-700">
                  {idx + 1}. <strong>{candidate.full_name}</strong> (
                  {candidate.email}) - <em>{candidate.position}</em>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ✅ FORM: Nhập ngày và giờ phỏng vấn */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ngày phỏng vấn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Ngày Phỏng Vấn
            </label>
            <input
              type="date"
              name="interview_date"
              value={formData.interview_date}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-purple-500"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Giờ phỏng vấn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} className="inline mr-1" />
              Giờ Phỏng Vấn
            </label>
            <input
              type="time"
              name="interview_time"
              value={formData.interview_time}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-purple-500"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* ✅ BUTTONS: Hủy + Gửi */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
              disabled={isSubmitting}
            >
              ✕ Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2 disabled:bg-purple-400 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Gửi cho {passedApplicants.length} ứng viên</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteScheduleModal;
