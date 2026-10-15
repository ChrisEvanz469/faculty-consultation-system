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

  static async checkSlotConflict(faculty_id, consultation_date, time_slot) {
    const sql = `
      SELECT id FROM consultations 
      WHERE faculty_id = ? 
        AND consultation_date = ? 
        AND time_slot = ? 
        AND status IN ('pending', 'confirmed')
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [faculty_id, consultation_date, time_slot]);
    return rows.length > 0;
  }

  static async getBookedSlots(faculty_id, consultation_date) {
    const sql = `
      SELECT time_slot FROM consultations
      WHERE faculty_id = ? 
        AND consultation_date = ? 
        AND status IN ('pending', 'confirmed')
    `;
    const [rows] = await db.query(sql, [faculty_id, consultation_date]);
    return rows.map(r => r.time_slot);
  }

  static async getByStudent(student_id) {
    const sql = `
      SELECT c.*, 
             u.full_name AS faculty_name, u.email AS faculty_email, u.department AS faculty_dept,
             fp.office_location, fp.consultation_mode,
             cr.id AS review_id, cr.rating AS review_rating, cr.comment AS review_comment
      FROM consultations c
      JOIN users u ON c.faculty_id = u.id
      LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
      LEFT JOIN consultation_reviews cr ON c.id = cr.consultation_id
      WHERE c.student_id = ?
      ORDER BY c.created_at DESC
    `;
    const [rows] = await db.query(sql, [student_id]);
    return rows;
  }

  static async getByFaculty(faculty_id) {
    const sql = `
      SELECT c.*, 
             s.full_name AS student_name, s.id_number AS student_id_no, s.email AS student_email, s.department AS student_dept,
             cr.rating AS review_rating, cr.comment AS review_comment
      FROM consultations c
      JOIN users s ON c.student_id = s.id
      LEFT JOIN consultation_reviews cr ON c.id = cr.consultation_id
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

  static async updateStatus(id, status, faculty_notes) {
    const sql = `UPDATE consultations SET status = ?, faculty_notes = ? WHERE id = ?`;
    await db.query(sql, [status, faculty_notes || null, id]);
  }

  static async deleteById(id, userId, role) {
    let sql = '';
    let params = [];
    if (role === 'student') {
      sql = 'DELETE FROM consultations WHERE id = ? AND student_id = ?';
      params = [id, userId];
    } else if (role === 'faculty') {
      sql = 'DELETE FROM consultations WHERE id = ? AND faculty_id = ?';
      params = [id, userId];
    } else if (role === 'admin') {
      sql = 'DELETE FROM consultations WHERE id = ?';
      params = [id];
    }
    const [result] = await db.query(sql, params);
    return result.affectedRows > 0;
  }

  static async getMetrics(userId, role) {
    let whereClause = '';
    let params = [];
    if (role === 'student') {
      whereClause = 'WHERE student_id = ?';
      params = [userId];
    } else if (role === 'faculty') {
      whereClause = 'WHERE faculty_id = ?';
      params = [userId];
    }

    const sql = `
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'cancelled' OR status = 'rejected' THEN 1 ELSE 0 END) AS cancelled
      FROM consultations ${whereClause}
    `;
    const [rows] = await db.query(sql, params);
    const m = rows[0] || {};
    return {
      total: Number(m.total || 0),
      pending: Number(m.pending || 0),
      confirmed: Number(m.confirmed || 0),
      completed: Number(m.completed || 0),
      cancelled: Number(m.cancelled || 0)
    };
  }
}

module.exports = Consultation;
