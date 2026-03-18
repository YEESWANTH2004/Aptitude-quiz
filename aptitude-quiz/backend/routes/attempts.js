const express = require('express');
const router = express.Router();
const {
  startAttempt, submitAnswer, submitAttempt, terminateAttempt,
  getResult, getAllAttempts, getMyAttempts
} = require('../controllers/attemptController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.post('/start', startAttempt);
router.get('/my', getMyAttempts);
router.get('/', adminOnly, getAllAttempts);
router.post('/:id/answer', submitAnswer);
router.post('/:id/submit', submitAttempt);
router.post('/:id/terminate', terminateAttempt);
router.get('/:id/result', getResult);

module.exports = router;
