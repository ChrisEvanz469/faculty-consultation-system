const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/faculty', requireAuth, facultyController.showDirectory);
router.get('/faculty/:id/book', requireAuth, facultyController.showBookingPage);
router.get('/timetable', requireAuth, facultyController.showTimetable);

// Faculty Schedule Management Routes
router.get('/faculty/schedule', requireAuth, requireRole('faculty', 'admin'), facultyController.showManageSchedule);
router.post('/faculty/schedule/add', requireAuth, requireRole('faculty', 'admin'), facultyController.addSlot);
router.post('/faculty/schedule/delete', requireAuth, requireRole('faculty', 'admin'), facultyController.deleteSlot);
router.post('/faculty/profile/update', requireAuth, requireRole('faculty', 'admin'), facultyController.updateProfile);

module.exports = router;
