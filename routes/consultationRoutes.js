const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const { requireAuth } = require('../middleware/auth');

router.post('/consultations/book', requireAuth, consultationController.bookConsultation);
router.get('/consultations', requireAuth, consultationController.showLedger);
router.get('/consultations/slip/:ref', requireAuth, consultationController.showPrintSlip);

module.exports = router;
