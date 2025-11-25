import React, { useState } from "react";
import { Send, Rocket } from "lucide-react";

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
  const [isEvaluating, setIsEvaluating] = useState(false);

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

  // HÀM MỚI: Kích hoạt luồng đánh giá ứng viên
  const handleTriggerEvaluation = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn bắt đầu luồng đánh giá ứng viên không?"
      )
    ) {
      return;
    }
    setIsEvaluating(true);
    try {
      const response = await fetch(`${API_URL}/trigger-evaluation`, {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Có lỗi xảy ra.");
      }
      alert("Đã gửi yêu cầu đánh giá ứng viên thành công!");
    } catch (error) {
      console.error("Lỗi khi kích hoạt đánh giá:", error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* NÚT MỚI ĐỂ ĐÁNH GIÁ ỨNG VIÊN */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Chạy Tác vụ Tự động
        </h3>
        <p className="text-gray-600 mb-4">
          Nhấn nút bên dưới để kích hoạt luồng tự động lấy dữ liệu và đánh giá
          các ứng viên mới bằng AI.
        </p>
        <button
          onClick={handleTriggerEvaluation}
          disabled={isEvaluating}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors disabled:bg-green-400"
        >
          <Rocket size={18} />
          <span>
            {isEvaluating ? "Đang xử lý..." : "Bắt đầu Đánh giá Ứng viên"}
          </span>
        </button>
      </div>

      {/* Form tạo tin tuyển dụng của bạn */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Tạo tin tuyển dụng mới
        </h3>
        <form onSubmit={handleRecruitmentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-purple-700 transition-colors disabled:bg-purple-400"
            >
              <Send size={18} />
              <span>{isSubmitting ? "Đang đăng..." : "Đăng tin"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TabRecruitment;
