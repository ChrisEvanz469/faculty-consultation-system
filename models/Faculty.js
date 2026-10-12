const db = require('../config/db');

class Faculty {
  static async getAll() {
    const sql = `
      SELECT u.id, u.id_number, u.full_name, u.email, u.department,
             fp.office_location, fp.consultation_mode, fp.meeting_link
      FROM users u
      LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
      WHERE u.role = 'faculty'
      ORDER BY u.full_name ASC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async getById(id) {
    const sql = `
      SELECT u.id, u.id_number, u.full_name, u.email, u.department,
             fp.office_location, fp.consultation_mode, fp.meeting_link
      FROM users u
      LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
      WHERE u.id = ? AND u.role = 'faculty'
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  }
}

module.exports = Faculty;
