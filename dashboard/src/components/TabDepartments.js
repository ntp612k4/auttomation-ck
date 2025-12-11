import React, { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";
import {
  fetchSurveyResponses,
  fetchSurveyStats,
  triggerHealthGuidanceWorkflow,
} from "../services/api";

const TabDepartments = () => {
  const [surveys, setSurveys] = useState([]);
  // ✅ SỬA: Xóa TRUNG_BINH
  const [stats, setStats] = useState({
    CAO: 0,
    THAP: 0,
    total: 0,
  });
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [sendingEmail, setSendingEmail] = useState({});

  const loadSurveyData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchSurveyResponses(selectedUrgency);
      setSurveys(data || []);
    } catch (error) {
      console.error("❌ Lỗi:", error);
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  }, [selectedUrgency]);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchSurveyStats();
      // ✅ SỬA: Chỉ CAO & THAP
      setStats(data || { CAO: 0, THAP: 0, total: 0 });
    } catch (error) {
      console.error("❌ Lỗi:", error);
    }
  }, []);

  useEffect(() => {
    loadSurveyData();
    loadStats();
  }, [selectedUrgency, loadSurveyData, loadStats]);

  const handleRefresh = () => {
    loadSurveyData();
    loadStats();
  };

  const toggleExpandRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTriggerWorkflow = async (survey) => {
    try {
      setSendingEmail((prev) => ({ ...prev, [survey.id]: true }));

      const result = await triggerHealthGuidanceWorkflow(survey);

      if (result.success) {
        alert(
          `✅ ${
            survey.urgency_level === "CAO"
              ? "Gửi email hướng dẫn theo dõi sức khỏe"
              : "Gửi email cảm ơn"
          } thành công!`
        );
      } else {
        alert(`❌ Lỗi: ${result.message}`);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Lỗi khi trigger workflow");
    } finally {
      setSendingEmail((prev) => ({ ...prev, [survey.id]: false }));
    }
  };

  // ✅ SỬA: Xóa TRUNG_BINH khỏi urgencyStyles
  const urgencyStyles = {
    CAO: {
      badge: "bg-red-100 text-red-800",
      card: "border-l-4 border-red-500 bg-red-50",
      label: "🔴 CAO",
    },
    THAP: {
      badge: "bg-green-100 text-green-800",
      card: "border-l-4 border-green-500 bg-green-50",
      label: "🟢 THẤP",
    },
  };

  const getUrgencyStyle = (level) => {
    return (
      urgencyStyles[level] || {
        badge: "bg-gray-100 text-gray-800",
        card: "border-l-4 border-gray-500 bg-gray-50",
        label: "⚪ N/A",
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* ===== THỐNG KÊ - SỬA: CHỈ 3 CARDS (BỎ TRUNG_BINH) ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-semibold uppercase">
                Khẩn Cấp CAO
              </p>
              <p className="text-3xl font-bold text-red-700 mt-1">
                {stats.CAO || 0}
              </p>
            </div>
            <AlertTriangle className="text-red-500" size={48} />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold uppercase">
                Khẩn Cấp THẤP
              </p>
              <p className="text-3xl font-bold text-green-700 mt-1">
                {stats.THAP || 0}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={48} />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold uppercase">
                Tổng Cộng
              </p>
              <p className="text-3xl font-bold text-blue-700 mt-1">
                {stats.total || 0}
              </p>
            </div>
            <RefreshCw className="text-blue-500" size={48} />
          </div>
        </div>
      </div>

      {/* ===== FILTER - SỬA: CHỈ CAO & THAP ===== */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedUrgency("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedUrgency === "all"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ✅ Tất cả
          </button>

          {["CAO", "THAP"].map((level) => {
            const style = getUrgencyStyle(level);
            return (
              <button
                key={level}
                onClick={() => setSelectedUrgency(level)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedUrgency === level
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {style.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="ml-auto px-4 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* ===== DANH SÁCH - SỬA: BỎ ID ===== */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">
          📊 Danh Sách Khảo Sát Nhân Viên
        </h3>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="text-center">
              <RefreshCw
                className="animate-spin text-blue-500 mx-auto mb-4"
                size={48}
              />
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : surveys.length > 0 ? (
          <div className="space-y-4">
            {surveys.map((survey) => {
              const style = getUrgencyStyle(survey.urgency_level);
              const isExpanded = expandedRows[survey.id];

              return (
                <div
                  key={survey.id}
                  className={`rounded-lg border p-4 ${style.card} transition-all`}
                >
                  {/* HEADER - SỬA: BỎ ID */}
                  <div
                    onClick={() => toggleExpandRow(survey.id)}
                    className="cursor-pointer"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">
                          📧 Email
                        </p>
                        <p className="text-sm font-mono text-blue-600">
                          {survey.employee_email}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">
                          👤 Họ Tên
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {survey.employee_name}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">
                          ⚠️ Mức Độ
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${style.badge}`}
                        >
                          {style.label}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTriggerWorkflow(survey);
                          }}
                          disabled={sendingEmail[survey.id]}
                          className="px-3 py-1 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <Send
                            size={14}
                            className={
                              sendingEmail[survey.id] ? "animate-spin" : ""
                            }
                          />
                          {sendingEmail[survey.id] ? "Gửi..." : "Email"}
                        </button>
                      </div>

                      <div className="flex justify-end">
                        {isExpanded ? (
                          <ChevronUp className="text-gray-500" />
                        ) : (
                          <ChevronDown className="text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED DETAILS */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-300 space-y-4">
                      <div className="bg-white rounded p-3 border border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          📝 Tóm Tắt AI:
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {survey.ai_summary || "Không có tóm tắt"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {survey.position && (
                          <div className="bg-white rounded p-2 border border-gray-200">
                            <p className="text-gray-600">Chức vụ:</p>
                            <p className="font-bold text-gray-800">
                              {survey.position}
                            </p>
                          </div>
                        )}
                        {survey.department_name && (
                          <div className="bg-white rounded p-2 border border-gray-200">
                            <p className="text-gray-600">Phòng ban:</p>
                            <p className="font-bold text-gray-800">
                              {survey.department_name}
                            </p>
                          </div>
                        )}
                        <div className="bg-white rounded p-2 border border-gray-200">
                          <p className="text-gray-600">Ngày khảo sát:</p>
                          <p className="font-bold text-gray-800">
                            {formatDate(survey.survey_date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">❌ Không có dữ liệu khảo sát nào</p>
            <p className="text-sm mt-2">Vui lòng đợi khi N8N gửi dữ liệu...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabDepartments;
