const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT id, id_number, username, email, role, full_name, department FROM users WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  static async verifyPassword(plainPassword, passwordHash) {
    return await bcrypt.compare(plainPassword, passwordHash);
  }

  static async checkExisting(username, email, id_number) {
    const [rows] = await db.query(
      'SELECT username, email, id_number FROM users WHERE username = ? OR email = ? OR id_number = ? LIMIT 1',
      [username, email, id_number]
    );
    return rows[0] || null;
  }

  static async create({ id_number, username, email, password, role, full_name, department }) {
    const password_hash = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO users (id_number, username, email, password_hash, role, full_name, department)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [id_number, username, email, password_hash, role, full_name, department]);
    const userId = result.insertId;

    if (role === 'faculty') {
      await db.query(`
        INSERT INTO faculty_profiles (user_id, office_location, consultation_mode, meeting_link)
        VALUES (?, 'CCS Faculty Lounge', 'In-Person', NULL)
        ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)
      `, [userId]);

      await db.query(`
        INSERT INTO availability_slots (faculty_id, day_of_week, start_time, end_time, max_students)
        VALUES (?, 'Monday', '09:00:00', '11:00:00', 4),
               (?, 'Thursday', '13:00:00', '15:00:00', 4)
      `, [userId, userId]);
    }

    return userId;
  }
}

module.exports = User;
