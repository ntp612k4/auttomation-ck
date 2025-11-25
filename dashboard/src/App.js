import React, { useState, useEffect } from "react";
import { Activity, Users } from "lucide-react";
import TabOverview from "./components/TabOverview";
import TabDepartments from "./components/TabDepartments";
import TabEmployees from "./components/TabEmployees";
import TabRecruitment from "./components/TabRecruitment";
import TabPassedApplicants from "./components/TabPassedApplicants";
import InviteModal from "./components/modals/InviteModal"; // 👈 THÊM DÒNG NÀY
import { fetchDepartments, fetchEmployees, fetchAiIndex } from "./services/api";

const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showInviteModal, setShowInviteModal] = useState(false); // 👈 THÊM DÒNG NÀY
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [aiData, setAiData] = useState([]);
  const [overviewStats, setOverviewStats] = useState({
    totalEmployees: 0,
    highRiskCount: 0,
    departmentStats: [],
  });
  const [highUrgencyCount, setHighUrgencyCount] = useState(0);

  useEffect(() => {
    if (activeTab !== "pass" && activeTab !== "recruitment") {
      loadCommonData();
    }
  }, [activeTab]);

  const loadCommonData = async () => {
    setLoading(true);
    try {
      const [deptData, empData, aiRes] = await Promise.all([
        fetchDepartments(),
        fetchEmployees(),
        fetchAiIndex(),
      ]);

      setDepartments(deptData);
      setEmployees(empData);
      setAiData(aiRes);

      // Calculate Stats Logic reused from original
      const totalEmployees = empData.length;
      const highRiskCountFromStats = empData.filter(
        (emp) => emp.burnout_score >= 70 || emp.stress_level >= 8
      ).length;
      const departmentStats = deptData.map((dept) => {
        const deptEmployees = empData.filter(
          (emp) => emp.department_id === dept.department_id
        );
        return {
          name: dept.department_name,
          total: deptEmployees.length,
          highRisk: deptEmployees.filter(
            (emp) => emp.burnout_score >= 70 || emp.stress_level >= 8
          ).length,
        };
      });
      setOverviewStats({
        totalEmployees,
        highRiskCount: highRiskCountFromStats,
        departmentStats,
      });

      const aiHighUrgency = aiRes.filter(
        (item) => item.mucDoKhanCap === "CAO"
      ).length;
      setHighUrgencyCount(aiHighUrgency);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-4xl mr-4">🏢</div>
            <div>
              <h1 className="text-3xl font-bold mb-1">
                HR Analytics Dashboard
              </h1>
              <p className="text-blue-100">
                Quản lý nhân viên và phân tích dữ liệu
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex space-x-8">
          {[
            { id: "overview", label: "Tổng quan", icon: Activity },
            { id: "departments", label: "Phòng ban (AI)", icon: Users },
            { id: "employees", label: "Nhân viên", icon: Users },
            { id: "recruitment", label: "Tuyển dụng", icon: Activity },
            { id: "pass", label: "Ứng viên đạt PV", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <tab.icon size={20} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === "overview" && (
          <TabOverview
            overviewStats={overviewStats}
            highUrgencyCount={highUrgencyCount}
            departmentsCount={departments.length}
          />
        )}
        {activeTab === "departments" && <TabDepartments aiData={aiData} />}
        {activeTab === "employees" && (
          <TabEmployees
            employees={employees}
            departments={departments}
            refreshData={loadCommonData}
            loading={loading}
          />
        )}
        {activeTab === "recruitment" && <TabRecruitment />}
        {activeTab === "pass" && (
          <TabPassedApplicants
            onShowInviteModal={() => setShowInviteModal(true)}
          />
        )}
      </div>

      {/* Render Modal ở đây, bên ngoài các tab */}
      {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
};
export default HRDashboard;
