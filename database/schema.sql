CREATE DATABASE IF NOT EXISTS faculty_consultation_db;
USE faculty_consultation_db;

-- 1. Users table (Students, Faculty, Department Chairs/Admins)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_number VARCHAR(50) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'faculty', 'admin') NOT NULL DEFAULT 'student',
  full_name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Faculty Profiles
CREATE TABLE IF NOT EXISTS faculty_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  office_location VARCHAR(100) NOT NULL DEFAULT 'Faculty Consultation Office',
  consultation_mode ENUM('In-Person', 'Online', 'Hybrid') DEFAULT 'In-Person',
  meeting_link VARCHAR(255) NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Faculty Recurring Availability Slots
CREATE TABLE IF NOT EXISTS availability_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT NOT NULL,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_students INT DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Consultation Bookings
CREATE TABLE IF NOT EXISTS consultations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference_no VARCHAR(50) NOT NULL UNIQUE,
  student_id INT NOT NULL,
  faculty_id INT NOT NULL,
  consultation_date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  subject_code VARCHAR(50) NULL,
  topic_agenda TEXT NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rejected') DEFAULT 'pending',
  faculty_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;