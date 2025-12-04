// import React, { useState } from "react";

// const API_URL = "http://localhost:3001/api";

// const InviteModal = ({ onClose }) => {
//   const [inviteData, setInviteData] = useState({
//     interview_time: "",
//     interview_date: "",
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       const res = await fetch(
//         `${API_URL}/applicants-pass/send-interview-invites`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(inviteData),
//         }
//       );
//       if (!res.ok) throw new Error("Lỗi");
//       alert("Đã gửi yêu cầu!");
//       onClose();
//     } catch (e) {
//       alert(e.message);
//     }
//     setIsSubmitting(false);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded p-6 w-full max-w-md shadow-xl">
//         <h4 className="text-xl font-semibold mb-4">
//           Gửi Lịch phỏng vấn Hàng loạt
//         </h4>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium">Ngày phỏng vấn</label>
//             <input
//               type="date"
//               className="border w-full p-2 rounded"
//               value={inviteData.interview_date}
//               onChange={(e) =>
//                 setInviteData({ ...inviteData, interview_date: e.target.value })
//               }
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium">Giờ phỏng vấn</label>
//             <input
//               type="text"
//               className="border w-full p-2 rounded"
//               placeholder="09:00 AM"
//               value={inviteData.interview_time}
//               onChange={(e) =>
//                 setInviteData({ ...inviteData, interview_time: e.target.value })
//               }
//               required
//             />
//           </div>
//           <div className="flex justify-end gap-4 mt-6">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
//             >
//               Hủy
//             </button>
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
//             >
//               {isSubmitting ? "..." : "Gửi"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };
// export default InviteModal;
