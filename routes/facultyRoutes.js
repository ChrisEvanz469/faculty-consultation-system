const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { requireAuth } = require('../middleware/auth');

router.get('/faculty', requireAuth, facultyController.showDirectory);
router.get('/faculty/:id/book', requireAuth, facultyController.showBookingPage);
router.get('/timetable', requireAuth, facultyController.showTimetable);

module.exports = router;
