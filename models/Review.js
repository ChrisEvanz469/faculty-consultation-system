const db = require('../config/db');

class Review {
  static async create({ consultation_id, faculty_id, student_id, rating, comment }) {
    const sql = `
      INSERT INTO consultation_reviews (consultation_id, faculty_id, student_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [consultation_id, faculty_id, student_id, rating, comment]);
    return result.insertId;
  }

  static async getByFaculty(faculty_id) {
    const sql = `
      SELECT cr.*, s.full_name AS student_name
      FROM consultation_reviews cr
      JOIN users s ON cr.student_id = s.id
      WHERE cr.faculty_id = ?
      ORDER BY cr.created_at DESC
    `;
    const [rows] = await db.query(sql, [faculty_id]);
    return rows;
  }
}

module.exports = Review;
