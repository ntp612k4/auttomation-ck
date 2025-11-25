-- ===================================================
-- SETUP MAIN DATABASE (n8n_db)
-- ===================================================
USE n8n_db;

-- ===================================================
-- Bảng Departments
-- ===================================================
CREATE TABLE IF NOT EXISTS departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    manager_name VARCHAR(100),
    manager_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert departments mẫu
INSERT INTO departments (name, code, manager_name, manager_email) VALUES
('Information Technology', 'IT', 'Manager IT', 'manager.it@company.com'),
('Sales', 'SALES', 'Manager Sales', 'manager.sales@company.com'),
('Marketing', 'MKT', 'Manager Marketing', 'manager.mkt@company.com'),
('Human Resources', 'HR', 'Manager HR', 'manager.hr@company.com'),
('Design', 'DESIGN', 'Manager Design', 'manager.design@company.com')
ON DUPLICATE KEY UPDATE name=name;

-- ===================================================
-- Bảng Employees
-- ===================================================
CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    position VARCHAR(100),
    status ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE') DEFAULT 'ACTIVE',
    join_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Dữ liệu mẫu
INSERT INTO employees (employee_code, name, email, department_id, position, status, join_date) VALUES
('EMP001', 'Nguyễn Thanh Phong', 'nguyenthanhphongtin92018@gmail.com', 1, 'Developer', 'ACTIVE', '2023-01-15')
ON DUPLICATE KEY UPDATE name=name;

-- ===================================================
-- ===================================================
-- View for Dashboard
-- ===================================================
CREATE OR REPLACE VIEW v_department_stats AS
SELECT 
    d.id AS department_id,
    d.name AS department_name,
    COUNT(DISTINCT e.id) AS total_employees,
    ROUND(AVG(sr.ai_burnout_score), 0) AS avg_burnout_score,
    COUNT(DISTINCT sr.id) AS total_responses
FROM departments d
LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'ACTIVE'
LEFT JOIN survey_responses sr ON e.id = sr.employee_id
GROUP BY d.id, d.name;

-- Bảng Survey Responses
-- ===================================================
CREATE TABLE IF NOT EXISTS survey_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL COMMENT 'ID của nhân viên',
    survey_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày thực hiện khảo sát',
    
    -- Dữ liệu thô từ khảo sát
    satisfaction_score INT COMMENT 'Mức độ hài lòng (0-10)',
    stress_level INT COMMENT 'Mức độ căng thẳng (0-10)',
    work_life_balance INT COMMENT 'Cân bằng công việc-đời sống (0-10)',
    comments TEXT COMMENT 'Góp ý thêm từ nhân viên',
    
    -- Kết quả phân tích từ AI
    ai_sentiment VARCHAR(50) COMMENT 'Sắc thái chung (Positive, Negative, Neutral)',
    ai_burnout_score INT COMMENT 'Điểm kiệt sức do AI đánh giá (0-100)',
    ai_summary TEXT COMMENT 'Tóm tắt của AI về phản hồi',
    needs_attention BOOLEAN DEFAULT FALSE COMMENT 'Cờ đánh dấu cần sự chú ý từ HR',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_id (employee_id),
    INDEX idx_needs_attention (needs_attention)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lưu trữ phản hồi khảo sát của nhân viên';


-- Tạo bảng job_applications trước
CREATE TABLE IF NOT EXISTS job_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  position VARCHAR(100) NOT NULL,
  resume_url TEXT,
  cover_letter TEXT,
  status ENUM('pending', 'reviewing', 'interviewed', 'hired', 'rejected') DEFAULT 'pending',
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_position (position)
);

-- Thêm dữ liệu mẫu
INSERT INTO job_applications (full_name, email, phone, position, resume_url, status) VALUES
('Nguyễn Thành Phong', 'phongnt.22it@gmail.com', '0912213213', 'Developer', 'https://example.com/resume1.pdf', 'pending'),
('Trần Văn An', 'vanan@gmail.com', '0909123456', 'Designer', 'https://example.com/resume2.pdf', 'pending'),
('Lê Thị Bích', 'bichle@gmail.com', '0908765432', 'Tester', 'https://example.com/resume3.pdf', 'pending'),
('Phạm Minh Tuấn', 'tuanpm@gmail.com', '0907654321', 'Developer', 'https://example.com/resume4.pdf', 'pending'),
('Hoàng Thu Hà', 'hath@gmail.com', '0906543210', 'Product Manager', 'https://example.com/resume5.pdf', 'pending');

DROP TABLE IF EXISTS ai_evaluation_results;

CREATE TABLE IF NOT EXISTS ai_evaluation_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Thông tin ứng viên
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    position VARCHAR(255) NOT NULL,
    
    -- Điểm đánh giá AI
    education_score INT DEFAULT 0 COMMENT 'Điểm học vấn (0-100)',
    language_score INT DEFAULT 0 COMMENT 'Điểm ngoại ngữ (0-100)',
    experience_score INT DEFAULT 0 COMMENT 'Điểm kinh nghiệm (0-100)',
    skills_score INT DEFAULT 0 COMMENT 'Điểm kỹ năng (0-100)',
    motivation_score INT DEFAULT 0 COMMENT 'Điểm động lực (0-100)',
    
    -- Tổng điểm và đề xuất
    ai_overall_score DECIMAL(5,2) DEFAULT 0 COMMENT 'Điểm tổng (0-100)',
    ai_recommendation VARCHAR(20) DEFAULT 'PENDING' COMMENT 'ĐẠT/KHÔNG ĐẠT/PENDING',
    is_passed BOOLEAN DEFAULT FALSE COMMENT 'Có đạt yêu cầu không',
    
    -- Phân tích chi tiết
    ai_reasoning TEXT COMMENT 'Lý do đánh giá của AI',
    strengths TEXT COMMENT 'Điểm mạnh (JSON array)',
    concerns TEXT COMMENT 'Điểm cần lưu ý (JSON array)',
    interview_topics TEXT COMMENT 'Chủ đề phỏng vấn đề xuất (JSON array)',
    
    -- Metadata
    status VARCHAR(50) DEFAULT 'NEW' COMMENT 'NEW/REVIEWED/CONTACTED/REJECTED',
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_ai_recommendation (ai_recommendation),
    INDEX idx_is_passed (is_passed),
    INDEX idx_evaluated_at (evaluated_at),
    INDEX idx_full_name (full_name),
    INDEX idx_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu kết quả AI đánh giá ứng viên';


-- Drop bảng cũ nếu tồn tại
DROP TABLE IF EXISTS applicant_pass;
CREATE TABLE IF NOT EXISTS applicant_pass (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  position VARCHAR(100) NOT NULL,
  ai_overall_score DECIMAL(5,2),
  ai_recommendation VARCHAR(50),
  is_passed BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
