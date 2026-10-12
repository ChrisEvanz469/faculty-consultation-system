const db = require('../config/db');

class Consultation {
  static async create({ student_id, faculty_id, consultation_date, time_slot, subject_code, topic_agenda }) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reference_no = `CONS-2026-${randomSuffix}`;

    const sql = `
      INSERT INTO consultations 
      (reference_no, student_id, faculty_id, consultation_date, time_slot, subject_code, topic_agenda, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `;
    await db.query(sql, [reference_no, student_id, faculty_id, consultation_date, time_slot, subject_code, topic_agenda]);
    return reference_no;
  }

  static async getByStudent(student_id) {
    const sql = `
      SELECT c.*, 
             u.full_name AS faculty_name, u.email AS faculty_email, u.department AS faculty_dept,
             fp.office_location, fp.consultation_mode
      FROM consultations c
      JOIN users u ON c.faculty_id = u.id
      LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
      WHERE c.student_id = ?
      ORDER BY c.created_at DESC
    `;
    const [rows] = await db.query(sql, [student_id]);
    return rows;
  }

  static async getByFaculty(faculty_id) {
    const sql = `
      SELECT c.*, 
             s.full_name AS student_name, s.id_number AS student_id_no, s.email AS student_email, s.department AS student_dept
      FROM consultations c
      JOIN users s ON c.student_id = s.id
      WHERE c.faculty_id = ?
      ORDER BY c.created_at DESC
    `;
    const [rows] = await db.query(sql, [faculty_id]);
    return rows;
  }

  static async getByReference(reference_no) {
    const sql = `
      SELECT c.*, 
             s.full_name AS student_name, s.id_number AS student_id_no, s.email AS student_email, s.department AS student_dept,
             f.full_name AS faculty_name, f.id_number AS faculty_id_no, f.email AS faculty_email, f.department AS faculty_dept,
             fp.office_location, fp.consultation_mode
      FROM consultations c
      JOIN users s ON c.student_id = s.id
      JOIN users f ON c.faculty_id = f.id
      LEFT JOIN faculty_profiles fp ON f.id = fp.user_id
      WHERE c.reference_no = ?
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [reference_no]);
    return rows[0] || null;
  }
}

module.exports = Consultation;
