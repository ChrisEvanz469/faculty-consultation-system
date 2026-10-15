const Faculty = require('../models/Faculty');
const Consultation = require('../models/Consultation');

exports.showDirectory = async (req, res) => {
  try {
    // If instructor logs in and accesses /faculty, redirect to Dashboard
    if (req.session.user.role === 'faculty') {
      return res.redirect('/dashboard');
    }

    const facultyList = await Faculty.getAll();
    res.render('faculty/index', {
      user: req.session.user,
      facultyList
    });
  } catch (err) {
    console.error('Error loading faculty directory:', err.message);
    res.status(500).send('Internal Server Error');
  }
};

exports.showBookingPage = async (req, res) => {
  try {
    if (req.session.user.role === 'faculty') {
      return res.redirect('/dashboard');
    }

    const faculty = await Faculty.getById(req.params.id);
    if (!faculty) return res.status(404).send('Faculty member not found.');

    const bookedConsultations = await Consultation.getByFaculty(faculty.id);

    res.render('faculty/book', {
      user: req.session.user,
      f: faculty,
      bookedConsultations: JSON.stringify(bookedConsultations)
    });
  } catch (err) {
    console.error('Error loading booking profile:', err.message);
    res.status(500).send('Internal Server Error');
  }
};

exports.showTimetable = async (req, res) => {
  try {
    // If faculty visits timetable, send them to their own schedule manager
    if (req.session.user.role === 'faculty') {
      return res.redirect('/faculty/schedule');
    }

    const matrix = await Faculty.getWeeklyMatrix();
    res.render('faculty/timetable', {
      user: req.session.user,
      matrix
    });
  } catch (err) {
    console.error('Error loading weekly timetable:', err.message);
    res.status(500).send('Internal Server Error');
  }
};

// Faculty-only: Manage My Availability & Office Hours
exports.showManageSchedule = async (req, res) => {
  try {
    const faculty = await Faculty.getById(req.session.user.id);
    res.render('faculty/manage_schedule', {
      user: req.session.user,
      f: faculty
    });
  } catch (err) {
    console.error('Error loading schedule manager:', err.message);
    res.status(500).send('Internal Server Error');
  }
};

exports.addSlot = async (req, res) => {
  try {
    const { day_of_week, start_time, end_time, max_students } = req.body;
    await Faculty.addSlot({
      faculty_id: req.session.user.id,
      day_of_week,
      start_time,
      end_time,
      max_students: parseInt(max_students, 10) || 4
    });
    res.redirect('/faculty/schedule');
  } catch (err) {
    console.error('Error adding slot:', err.message);
    res.status(500).send('Failed to add consultation slot.');
  }
};

exports.deleteSlot = async (req, res) => {
  try {
    const { slot_id } = req.body;
    await Faculty.deleteSlot(slot_id, req.session.user.id);
    res.redirect('/faculty/schedule');
  } catch (err) {
    console.error('Error deleting slot:', err.message);
    res.status(500).send('Failed to remove consultation slot.');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { office_location, consultation_mode, meeting_link } = req.body;
    await Faculty.updateProfile(req.session.user.id, {
      office_location,
      consultation_mode,
      meeting_link
    });
    res.redirect('/faculty/schedule');
  } catch (err) {
    console.error('Error updating faculty office profile:', err.message);
    res.status(500).send('Failed to update office profile.');
  }
};
