const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seed() {
  try {
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);

    // Clear existing rows safely
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
       await db.query('TRUNCATE TABLE notifications');
   await db.query('TRUNCATE TABLE consultation_reviews');
await db.query('TRUNCATE TABLE availability_slots');
    await db.query('TRUNCATE TABLE consultations');
    await db.query('TRUNCATE TABLE faculty_profiles');
    await db.query('TRUNCATE TABLE users');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    // 1. Insert Users
    const usersSql = `
      INSERT INTO users (id, id_number, username, email, password_hash, role, full_name, department)
      VALUES 
      (1, 'PROF-2015-01', 'engr_reyes', 'reyes@faculty.cspc.edu.ph', ?, 'faculty', 'Engr. Manuel Reyes, PECE', 'College of Computer Studies'),
      (2, 'PROF-2018-09', 'dr_santos', 'santos@faculty.cspc.edu.ph', ?, 'faculty', 'Dr. Maria Santos, DIT', 'College of Computer Studies'),
      (3, '2023-10021', 'juan_student', 'juan.delacruz@student.cspc.edu.ph', ?, 'student', 'Juan Dela Cruz', 'BS Information Technology'),
      (4, 'ADMIN-001', 'admin_chair', 'chair.ccs@cspc.edu.ph', ?, 'admin', 'Dean / Department Chair', 'College of Computer Studies')
    `;
    await db.query(usersSql, [hash, hash, hash, hash]);

    // 2. Insert Faculty Profiles
    await db.query(`
      INSERT INTO faculty_profiles (user_id, office_location, consultation_mode, meeting_link)
      VALUES 
      (1, 'CCS Faculty Office - Cubicle 4', 'Hybrid', 'https://meet.google.com/abc-defg-hij'),
      (2, 'CCS IT Department Head Office', 'In-Person', NULL)
    `);

    // 3. Insert Availability Slots
    await db.query(`
      INSERT INTO availability_slots (faculty_id, day_of_week, start_time, end_time, max_students)
      VALUES 
      (1, 'Tuesday', '13:00:00', '15:00:00', 4),
      (1, 'Thursday', '10:00:00', '12:00:00', 4),
      (2, 'Monday', '09:00:00', '11:00:00', 3),
      (2, 'Wednesday', '14:00:00', '16:00:00', 3)
    `);

    console.log('Database seeded successfully!');
    console.log('All test users share password: password123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();