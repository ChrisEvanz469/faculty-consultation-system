const Faculty = require('../models/Faculty');
const Consultation = require('../models/Consultation');

exports.showDirectory = async (req, res) => {
  try {
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
