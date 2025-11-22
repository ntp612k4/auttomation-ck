import React from "react";

const TabDepartments = ({ aiData }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">
        Danh Sách Dự Đoán AI (AI Index)
      </h3>
      {aiData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Họ và Tên
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Mức độ khẩn cấp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {aiData.map((item) => {
                const urgencyColors = {
                  CAO: "bg-red-100 text-red-800 font-semibold",
                  "TRUNG BÌNH": "bg-yellow-100 text-yellow-800 font-semibold",
                  THẤP: "bg-green-100 text-green-800 font-semibold",
                  "KHÔNG XÁC ĐỊNH": "bg-gray-100 text-gray-700",
                };
                return (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.employeeEmail}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {item.employeeName}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          urgencyColors[item.mucDoKhanCap] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.mucDoKhanCap || "KHÔNG XÁC ĐỊNH"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">
          Không có dữ liệu AI Index nào được ghi nhận.
        </p>
      )}
    </div>
  );
};

export default TabDepartments;
