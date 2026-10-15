const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const { requireAuth } = require('../middleware/auth');

router.get('/dashboard', requireAuth, consultationController.showDashboard);
router.get('/consultations/booked-slots', requireAuth, consultationController.checkBookedSlots);
router.post('/consultations/book', requireAuth, consultationController.bookConsultation);
router.get('/consultations', requireAuth, consultationController.showLedger);
router.post('/consultations/status', requireAuth, consultationController.updateStatus);
router.post('/consultations/delete', requireAuth, consultationController.deleteConsultation);
router.post('/consultations/review', requireAuth, consultationController.submitReview);
router.post('/notifications/mark-read', requireAuth, consultationController.markNotificationsRead);
router.get('/consultations/slip/:ref', requireAuth, consultationController.showPrintSlip);

module.exports = router;
