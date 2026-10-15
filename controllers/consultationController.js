const Consultation = require('../models/Consultation');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const db = require('../config/db');

exports.showDashboard = async (req, res) => {
  try {
    const user = req.session.user;
    const metrics = await Consultation.getMetrics(user.id, user.role);
    let records = [];

    if (user.role === 'student') {
      records = await Consultation.getByStudent(user.id);
    } else {
      records = await Consultation.getByFaculty(user.id);
    }

    res.render('dashboard/index', { user, metrics, records });
  } catch (err) {
    console.error('Error loading dashboard:', err.message);
    res.status(500).send('Internal Server Error loading dashboard.');
  }
};

exports.checkBookedSlots = async (req, res) => {
  try {
    const { faculty_id, date } = req.query;
    if (!faculty_id || !date) {
      return res.json({ bookedSlots: [] });
    }
    const bookedSlots = await Consultation.getBookedSlots(faculty_id, date);
    res.json({ bookedSlots });
  } catch (err) {
    console.error('Error checking booked slots:', err.message);
    res.status(500).json({ error: 'Failed to verify slot availability' });
  }
};

exports.bookConsultation = async (req, res) => {
  try {
    const { faculty_id, consultation_date, time_slot, subject_code, topic_agenda } = req.body;
    const student = req.session.user;

    if (!faculty_id || !consultation_date || !time_slot || !topic_agenda) {
      return res.redirect('/faculty?error=missing_fields');
    }

    const isConflict = await Consultation.checkSlotConflict(faculty_id, consultation_date, time_slot);
    if (isConflict) {
      return res.redirect('/faculty?error=conflict');
    }

    const ref = await Consultation.create({
      student_id: student.id,
      faculty_id,
      consultation_date,
      time_slot,
      subject_code: subject_code || 'N/A',
      topic_agenda
    });

    await Notification.create({
      user_id: faculty_id,
      title: 'New Consultation Request',
      message: `${student.full_name} booked a session on ${consultation_date} (${time_slot}). Ref: ${ref}`,
      link: '/dashboard'
    });

    res.redirect('/consultations');
  } catch (err) {
    console.error('Error booking consultation:', err.message);
    res.redirect('/faculty?error=server_error');
  }
};

exports.showLedger = async (req, res) => {
  try {
    const user = req.session.user;
    let records = [];

    if (user.role === 'student') {
      records = await Consultation.getByStudent(user.id);
    } else {
      records = await Consultation.getByFaculty(user.id);
    }

    res.render('consultations/index', { user, records });
  } catch (err) {
    console.error('Error fetching consultation records:', err.message);
    res.status(500).send('Failed to load consultation records.');
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { consultation_id, status, faculty_notes } = req.body;
    const faculty = req.session.user;

    if (!consultation_id || !status) {
      return res.status(400).send('Consultation ID and status are required.');
    }

    await Consultation.updateStatus(consultation_id, status, faculty_notes);

    const [cRows] = await db.query('SELECT reference_no, student_id FROM consultations WHERE id = ?', [consultation_id]);
    if (cRows && cRows[0]) {
      const c = cRows[0];
      await Notification.create({
        user_id: c.student_id,
        title: `Consultation ${status.toUpperCase()}`,
        message: `${faculty.full_name} updated your appointment (${c.reference_no}) to "${status.toUpperCase()}".`,
        link: '/consultations'
      });
    }

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error updating status:', err.message);
    res.status(500).send('Failed to update consultation status.');
  }
};

exports.deleteConsultation = async (req, res) => {
  try {
    const { consultation_id } = req.body;
    const user = req.session.user;

    if (!consultation_id) {
      return res.status(400).send('Consultation ID required.');
    }

    // Notify counterpart before record deletion
    const [cRows] = await db.query('SELECT * FROM consultations WHERE id = ?', [consultation_id]);
    if (cRows && cRows[0]) {
      const c = cRows[0];
      if (user.role === 'student') {
        await Notification.create({
          user_id: c.faculty_id,
          title: 'Consultation Cancelled by Student',
          message: `${user.full_name} cancelled their consultation appointment (${c.reference_no}) scheduled for ${new Date(c.consultation_date).toLocaleDateString()} (${c.time_slot}).`,
          link: '/dashboard'
        });
      } else if (user.role === 'faculty') {
        await Notification.create({
          user_id: c.student_id,
          title: 'Consultation Removed by Faculty',
          message: `${user.full_name} removed consultation record (${c.reference_no}).`,
          link: '/consultations'
        });
      }
    }

    await Consultation.deleteById(consultation_id, user.id, user.role);

    const referer = req.get('Referrer') || '/consultations';
    res.redirect(referer);
  } catch (err) {
    console.error('Error deleting consultation:', err.message);
    res.status(500).send('Failed to delete consultation record.');
  }
};

exports.submitReview = async (req, res) => {
  try {
    const { consultation_id, faculty_id, rating, comment } = req.body;
    const student = req.session.user;

    if (!consultation_id || !faculty_id || !rating) {
      return res.status(400).send('Consultation ID, Faculty ID, and Rating are required.');
    }

    await Review.create({
      consultation_id,
      faculty_id,
      student_id: student.id,
      rating: parseInt(rating, 10),
      comment: comment || ''
    });

    await Notification.create({
      user_id: faculty_id,
      title: 'New Student Evaluation',
      message: `${student.full_name} submitted a ${rating}-star evaluation for your consultation session.`,
      link: '/dashboard'
    });

    res.redirect('/consultations');
  } catch (err) {
    console.error('Error submitting review:', err.message);
    res.status(500).send('Failed to submit consultation review.');
  }
};

exports.markNotificationsRead = async (req, res) => {
  try {
    if (req.session.user) {
      await Notification.markAllAsRead(req.session.user.id);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking notifications as read:', err.message);
    res.status(500).json({ error: 'Failed' });
  }
};

exports.showPrintSlip = async (req, res) => {
  try {
    const { ref } = req.params;
    const consultation = await Consultation.getByReference(ref);

    if (!consultation) {
      return res.status(404).send('Consultation slip not found.');
    }

    res.render('consultations/slip', { user: req.session.user, c: consultation });
  } catch (err) {
    console.error('Error loading consultation slip:', err.message);
    res.status(500).send('Error generating slip.');
  }
};
