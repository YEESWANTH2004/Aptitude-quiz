const express = require('express');
const router = express.Router();
const {
  getSessions, createSession, getSessionByCode, getSession, updateSession, deleteSession
} = require('../controllers/sessionController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', adminOnly, getSessions);
router.post('/', adminOnly, createSession);
router.get('/code/:code', getSessionByCode);
router.get('/:id', adminOnly, getSession);
router.put('/:id', adminOnly, updateSession);
router.delete('/:id', adminOnly, deleteSession);

module.exports = router;
