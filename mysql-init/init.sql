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
-- Bảng Job Applications
-- ===================================================
CREATE TABLE IF NOT EXISTS job_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL COMMENT 'Họ và tên đầy đủ',
    email VARCHAR(255) NOT NULL COMMENT 'Email',
    phone VARCHAR(20) COMMENT 'Số điện thoại',
    position VARCHAR(100) NOT NULL COMMENT 'Vị trí ứng tuyển',
    education VARCHAR(100) COMMENT 'Bằng cấp',
    language_cert VARCHAR(255) COMMENT 'Chứng chỉ ngoại ngữ',
    years_experience INT DEFAULT 0 COMMENT 'Kinh nghiệm (năm)',
    professional_skills TEXT COMMENT 'Kỹ năng chuyên môn',
    strengths TEXT COMMENT 'Điểm mạnh',
    motivation TEXT COMMENT 'Lý do ứng tuyển',
    ai_overall_score INT DEFAULT 0,
    ai_recommendation VARCHAR(20),
    ai_reasoning TEXT,
    status VARCHAR(20) DEFAULT 'NEW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status)
);

-- ===================================================
-- Bảng Training Schedule
-- ===================================================
CREATE TABLE IF NOT EXISTS training_schedule (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    training_date DATE,
    training_title VARCHAR(255),
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    feedback_score INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ===================================================
-- Bảng Survey Responses
-- ===================================================
CREATE TABLE IF NOT EXISTS survey_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    survey_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    satisfaction_score INT,
    stress_level INT,
    work_life_balance INT,
    comments TEXT,
    ai_burnout_score INT,
    ai_sentiment VARCHAR(50),
    needs_attention BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

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
