# Automation CK - Hệ Thống Quản Lý & Gắn Kết Nhân Sự

Hệ thống tự động hóa quy trình quản lý nhân sự: quản lý hồ sơ, tuyển dụng, phân tích mức độ gắn kết và tự động hóa (n8n).

## 🚀 Tính Năng

- Quản lý nhân viên (CRUD)
- Quản lý ứng viên, đánh giá AI, lưu ứng viên đạt
- Tuyển dụng: gửi yêu cầu đăng tin qua webhook n8n
- Dashboard thống kê (phòng ban, rủi ro, AI Index)
- Tự động gửi mail (qua n8n webhook)
- Triển khai nhanh bằng Docker Compose

## 🛠 Công Nghệ

| Layer      | Stack             |
| ---------- | ----------------- |
| Frontend   | React + Tailwind  |
| Backend    | Node.js (Express) |
| Database   | MySQL 8           |
| Automation | n8n               |
| DevOps     | Docker Compose    |

## 📁 Cấu Trúc Thư Mục

```
backend/
  src/
    config/
    controllers/
    routes/
    middleware/
dashboard/
  src/
    components/
    pages/
    routes/
n8n/.n8n/           (workflow data - ignored)
mysql-init/          (script khởi tạo DB nếu cần)
docker-compose.yml
```

## ⚙️ Chuẩn Bị Môi Trường

Yêu cầu:

- Docker & Docker Compose
- Git (tùy chọn)
- Node.js (chỉ nếu chạy thủ công ngoài Docker)

## 🔑 Biến Môi Trường

Tạo file `.env` (không commit). Mẫu trong `.env.example`:

```
MYSQL_ROOT_PASSWORD=change_me_root
MYSQL_USER=n8n_user
MYSQL_PASSWORD=change_me_user
MYSQL_DATABASE=n8n_db

N8N_JOB_POST_WEBHOOK_URL=http://n8n:5678/webhook/job-post
N8N_CANDIDATE_MAIL_WEBHOOK_URL=http://n8n:5678/webhook/candidate-mail
N8N_INTERVIEW_INVITE_WEBHOOK_URL=http://n8n:5678/webhook/interview-invite
```

Backend có thể dùng trực tiếp các biến DB\_\* nếu cần.

## ▶️ Chạy Bằng Docker

```
docker compose up -d --build
```

Truy cập:

- Frontend: http://localhost:8080
- Backend API (health): http://localhost:3001/health
- n8n: http://localhost:5678
- MySQL: host localhost port 3307

Dừng:

```
docker compose down
```

Xóa dữ liệu MySQL (reset):

```
docker volume rm employee-engagement-system_mysql_data
```

## 🧪 Chạy Thủ Công (Không Docker)

Backend:

```
cd backend
cp .env.example .env
npm install
npm run dev
```

Frontend:

```
cd dashboard
cp .env.example .env
npm install
npm start
```

## 🔌 API Backend (Đường dẫn chính)

Prefix: `/api`

- GET /employees
- POST /employees
- PUT /employees/:id
- DELETE /employees/:id
- GET /departments
- GET /departments/details
- POST /applicants
- GET /applicants
- PUT /applicants/:id/ai_result
- GET /applicants_pass_dat (ứng viên đạt - legacy)
- POST /applicants/pass
- DELETE /applicants/pass/:id
- POST /recruitment/post
- GET /ai_index
- GET /employee-analysis
- POST /stats/analysis (lưu phân tích)

(Tùy vào phiên bản bạn giữ nguyên logic ban đầu.)

## 🔄 Tự Động Hóa (n8n)

Các webhook cần tồn tại trong n8n:

- Đăng tin: `${N8N_JOB_POST_WEBHOOK_URL}`
- Gửi mail kết quả ứng viên: `${N8N_CANDIDATE_MAIL_WEBHOOK_URL}`
- Gửi mail phỏng vấn hàng loạt: `${N8N_INTERVIEW_INVITE_WEBHOOK_URL}`

## 🛡 Bảo Mật

- Không commit `.env`
- Không để mật khẩu thật trong `docker-compose.yml`
- Thay đổi mật khẩu mạnh khi triển khai thực tế
- Có thể bổ sung rate-limit / auth nếu đưa lên production

## 🧩 Mở Rộng

- Thêm xác thực JWT
- Phân quyền theo vai trò
- Thêm logging tập trung (ELK / Loki)
- Tích hợp gửi mail trực tiếp (SMTP) nếu không muốn qua n8n

## 📦 Git (Push Lên Repo)

```
git init
git add .
git commit -m "Initial project"
git branch -M main
git remote add origin https://github.com/ntp612k4/auttomation-ck.git
git push -u origin main
```

## ✅ Trạng Thái

Dự án tối ưu để người khác clone và chạy nhanh bằng Docker.

---
