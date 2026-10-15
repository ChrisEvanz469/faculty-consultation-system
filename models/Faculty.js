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

    for (let f of rows) {
      const [slots] = await db.query(
        'SELECT id, day_of_week, TIME_FORMAT(start_time, "%h:%i %p") as start_time, TIME_FORMAT(end_time, "%h:%i %p") as end_time, max_students FROM availability_slots WHERE faculty_id = ? AND is_active = TRUE ORDER BY FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"), start_time ASC',
        [f.id]
      );
      f.slots = slots;
      f.next_available = Faculty.calculateNextAvailable(slots);
    }

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
    if (!rows[0]) return null;

    const faculty = rows[0];
    const [slots] = await db.query(
      'SELECT id, day_of_week, TIME_FORMAT(start_time, "%h:%i %p") as start_time, TIME_FORMAT(end_time, "%h:%i %p") as end_time, max_students FROM availability_slots WHERE faculty_id = ? AND is_active = TRUE ORDER BY FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"), start_time ASC',
      [faculty.id]
    );
    faculty.slots = slots;
    faculty.next_available = Faculty.calculateNextAvailable(slots);
    return faculty;
  }

  static async getWeeklyMatrix() {
    const sql = `
      SELECT a.id AS slot_id, a.day_of_week, 
             TIME_FORMAT(a.start_time, "%h:%i %p") AS start_time, 
             TIME_FORMAT(a.end_time, "%h:%i %p") AS end_time,
             a.max_students,
             u.id AS faculty_id, u.full_name AS faculty_name, u.department,
             fp.office_location, fp.consultation_mode, fp.meeting_link
      FROM availability_slots a
      JOIN users u ON a.faculty_id = u.id
      LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
      WHERE a.is_active = TRUE
      ORDER BY FIELD(a.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), a.start_time ASC
    `;
    const [rows] = await db.query(sql);

    const matrix = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: []
    };

    rows.forEach(r => {
      if (matrix[r.day_of_week]) {
        matrix[r.day_of_week].push(r);
      }
    });

    return matrix;
  }

  static async addSlot({ faculty_id, day_of_week, start_time, end_time, max_students }) {
    const sql = `
      INSERT INTO availability_slots (faculty_id, day_of_week, start_time, end_time, max_students, is_active)
      VALUES (?, ?, ?, ?, ?, TRUE)
    `;
    await db.query(sql, [faculty_id, day_of_week, start_time, end_time, max_students || 4]);
  }

  static async deleteSlot(slot_id, faculty_id) {
    const sql = `DELETE FROM availability_slots WHERE id = ? AND faculty_id = ?`;
    await db.query(sql, [slot_id, faculty_id]);
  }

  static async updateProfile(user_id, { office_location, consultation_mode, meeting_link }) {
    const sql = `
      INSERT INTO faculty_profiles (user_id, office_location, consultation_mode, meeting_link)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        office_location = VALUES(office_location),
        consultation_mode = VALUES(consultation_mode),
        meeting_link = VALUES(meeting_link)
    `;
    await db.query(sql, [user_id, office_location, consultation_mode, meeting_link || null]);
  }

  static calculateNextAvailable(slots) {
    if (!slots || slots.length === 0) return 'No upcoming slots';
    const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    const today = new Date();
    const currentDay = today.getDay();

    let closestSlot = null;
    let minDiff = 8;

    for (let s of slots) {
      const targetDay = dayMap[s.day_of_week];
      let diff = targetDay - currentDay;
      if (diff <= 0) diff += 7;
      if (diff < minDiff) {
        minDiff = diff;
        closestSlot = s;
      }
    }

    if (!closestSlot) return 'Consultation TBA';
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + minDiff);
    const dateStr = nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${closestSlot.day_of_week}, ${dateStr} — ${closestSlot.start_time}`;
  }
}

module.exports = Faculty;
