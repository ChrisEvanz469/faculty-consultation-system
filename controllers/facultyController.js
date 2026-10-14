const Faculty = require('../models/Faculty');
const Consultation = require('../models/Consultation');

exports.showDirectory = async (req, res) => {
  try {
    const facultyList = await Faculty.getAll();
    
    // Greeting calculation
    const hour = new Date().getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';

    const todayFormatted = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    res.render('faculty/index', {
      user: req.session.user,
      facultyList,
      greeting,
      todayFormatted
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

    // Fetch existing booked consultations for this faculty
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
