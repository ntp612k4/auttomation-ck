import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Users, Activity, AlertTriangle } from "lucide-react";

const TabOverview = ({ overviewStats, highUrgencyCount, departmentsCount }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Tổng số nhân viên</p>
              <p className="text-4xl font-bold text-gray-900">
                {overviewStats.totalEmployees}
              </p>
            </div>
            <Users className="text-blue-500" size={48} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">
                NV có mức độ khẩn cấp cao
              </p>
              <p className="text-4xl font-bold text-red-600">
                {highUrgencyCount}
              </p>
            </div>
            <AlertTriangle className="text-red-500" size={48} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Số phòng ban</p>
              <p className="text-4xl font-bold text-gray-900">
                {departmentsCount}
              </p>
            </div>
            <Activity className="text-green-500" size={48} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">
          Thống kê theo phòng ban
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={overviewStats.departmentStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#3b82f6" name="Tổng NV" />
            <Bar dataKey="highRisk" fill="#ef4444" name="Rủi ro cao" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TabOverview;
