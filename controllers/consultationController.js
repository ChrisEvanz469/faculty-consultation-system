const Consultation = require('../models/Consultation');
const Review = require('../models/Review');

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

exports.bookConsultation = async (req, res) => {
  try {
    const { faculty_id, consultation_date, time_slot, subject_code, topic_agenda } = req.body;
    const student_id = req.session.user.id;

    if (!faculty_id || !consultation_date || !time_slot || !topic_agenda) {
      return res.status(400).send('Please fill in all required fields.');
    }

    await Consultation.create({
      student_id,
      faculty_id,
      consultation_date,
      time_slot,
      subject_code: subject_code || 'N/A',
      topic_agenda
    });

    res.redirect('/consultations');
  } catch (err) {
    console.error('Error booking consultation:', err.message);
    res.status(500).send('Failed to schedule consultation.');
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
    if (!consultation_id || !status) {
      return res.status(400).send('Consultation ID and status are required.');
    }

    await Consultation.updateStatus(consultation_id, status, faculty_notes);
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error updating status:', err.message);
    res.status(500).send('Failed to update consultation status.');
  }
};

exports.submitReview = async (req, res) => {
  try {
    const { consultation_id, faculty_id, rating, comment } = req.body;
    const student_id = req.session.user.id;

    if (!consultation_id || !faculty_id || !rating) {
      return res.status(400).send('Consultation ID, Faculty ID, and Rating are required.');
    }

    await Review.create({
      consultation_id,
      faculty_id,
      student_id,
      rating: parseInt(rating, 10),
      comment: comment || ''
    });

    res.redirect('/consultations');
  } catch (err) {
    console.error('Error submitting review:', err.message);
    res.status(500).send('Failed to submit consultation review.');
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
