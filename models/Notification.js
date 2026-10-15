const db = require('../config/db');

class Notification {
  static async create({ user_id, title, message, link }) {
    const sql = `
      INSERT INTO notifications (user_id, title, message, link)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [user_id, title, message, link || '/consultations']);
    return result.insertId;
  }

  static async getByUser(user_id, limit = 8) {
    const sql = `
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    const [rows] = await db.query(sql, [user_id, limit]);
    return rows;
  }

  static async getUnreadCount(user_id) {
    const sql = `SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = FALSE`;
    const [rows] = await db.query(sql, [user_id]);
    return rows[0] ? rows[0].unread : 0;
  }

  static async markAllAsRead(user_id) {
    const sql = `UPDATE notifications SET is_read = TRUE WHERE user_id = ?`;
    await db.query(sql, [user_id]);
  }
}

module.exports = Notification;
