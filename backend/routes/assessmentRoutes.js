const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, assessmentController.submitAssessment);
router.get('/history', authMiddleware, assessmentController.getHistory);
router.get('/analytics', authMiddleware, assessmentController.getAnalytics);

module.exports = router;

