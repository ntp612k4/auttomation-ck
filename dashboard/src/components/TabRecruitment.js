import React, { useState } from "react";

// Đảm bảo URL này khớp với backend của bạn (3001 hoặc port bạn đã cấu hình)
const API_URL = "http://localhost:3001/api";

const TabRecruitment = () => {
  const [recruitmentForm, setRecruitmentForm] = useState({
    position: "",
    quantity: "",
    salary: "",
    deadline: "",
    location: "",
    skills: "",
    formLink: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRecruitmentSubmit = async (e) => {
    e.preventDefault();

    // Validate cơ bản
    if (
      !recruitmentForm.position ||
      !recruitmentForm.deadline ||
      !recruitmentForm.formLink
    ) {
      alert(
        "Vui lòng nhập các trường bắt buộc: Vị trí, Hạn nộp và Đường dẫn ứng tuyển."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/recruitment/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recruitmentForm),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Thành công! Tin tuyển dụng sẽ được gửi đi.");
        // Reset form sau khi thành công
        setRecruitmentForm({
          position: "",
          quantity: "",
          salary: "",
          deadline: "",
          location: "",
          skills: "",
          formLink: "",
        });
      } else {
        throw new Error(result.message || "Có lỗi xảy ra.");
      }
    } catch (error) {
      alert(`Lỗi: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Tạo tin tuyển dụng mới
      </h3>
      <form onSubmit={handleRecruitmentSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vị trí tuyển dụng *
          </label>
          <input
            type="text"
            name="position"
            value={recruitmentForm.position}
            onChange={(e) =>
              setRecruitmentForm({
                ...recruitmentForm,
                position: e.target.value,
              })
            }
            placeholder="VD: Senior React Developer"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số lượng
          </label>
          <input
            type="number"
            name="quantity"
            value={recruitmentForm.quantity}
            onChange={(e) =>
              setRecruitmentForm({
                ...recruitmentForm,
                quantity: e.target.value,
              })
            }
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mức lương (dạng text)
          </label>
          <input
            type="text"
            name="salary"
            value={recruitmentForm.salary}
            onChange={(e) =>
              setRecruitmentForm({
                ...recruitmentForm,
                salary: e.target.value,
              })
            }
            placeholder="VD: 10-20 triệu (thỏa thuận)"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa điểm làm việc
          </label>
          <input
            type="text"
            name="location"
            value={recruitmentForm.location}
            onChange={(e) =>
              setRecruitmentForm({
                ...recruitmentForm,
                location: e.target.value,
              })
            }
            placeholder="VD: Hà Nội / HCM"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kỹ năng yêu cầu
          </label>
          <input
            type="text"
            name="skills"
            value={recruitmentForm.skills}
            onChange={(e) =>
              setRecruitmentForm({
                ...recruitmentForm,
                skills: e.target.value,
              })
            }
            placeholder="VD: ReactJS, NodeJS, AWS"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đường dẫn ứng tuyển (Google Form, etc.) *
          </label>
          <input
            type="url"
            name="formLink"
            value={recruitmentForm.formLink}
            onChange={(e) =>
              setRecruitmentForm({
                ...recruitmentForm,
                formLink: e.target.value,
              })
            }
            placeholder="https://forms.gle/..."
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hạn nộp hồ sơ *
          </label>
          <input
            type="date"
            name="deadline"
            value={recruitmentForm.deadline}
            onChange={(e) =>
              setRecruitmentForm({
                ...recruitmentForm,
                deadline: e.target.value,
              })
            }
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng tin lên Facebook"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TabRecruitment;
