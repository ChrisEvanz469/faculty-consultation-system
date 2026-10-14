const db = require('../config/db');

class Faculty {
  static async getAll() {
    const sql = `
      SELECT u.id, u.id_number, u.full_name, u.email, u.department,
             fp.office_location, fp.consultation_mode, fp.meeting_link,
             ROUND(AVG(cr.rating), 1) AS avg_rating,
             COUNT(cr.id) AS review_count
      FROM users u
      LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
      LEFT JOIN consultation_reviews cr ON u.id = cr.faculty_id
      WHERE u.role = 'faculty'
      GROUP BY u.id, u.id_number, u.full_name, u.email, u.department,
               fp.office_location, fp.consultation_mode, fp.meeting_link
      ORDER BY u.full_name ASC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async getById(id) {
    const sql = `
      SELECT u.id, u.id_number, u.full_name, u.email, u.department,
             fp.office_location, fp.consultation_mode, fp.meeting_link,
             ROUND(AVG(cr.rating), 1) AS avg_rating,
             COUNT(cr.id) AS review_count
      FROM users u
      LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
      LEFT JOIN consultation_reviews cr ON u.id = cr.faculty_id
      WHERE u.id = ? AND u.role = 'faculty'
      GROUP BY u.id, u.id_number, u.full_name, u.email, u.department,
               fp.office_location, fp.consultation_mode, fp.meeting_link
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  }
}

module.exports = Faculty;
