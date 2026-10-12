const Faculty = require('../models/Faculty');

exports.showDirectory = async (req, res) => {
  try {
    const facultyList = await Faculty.getAll();
    res.render('faculty/index', { user: req.session.user, facultyList });
  } catch (err) {
    console.error('Error loading faculty directory:', err.message);
    res.status(500).send('Internal Server Error');
  }
};
