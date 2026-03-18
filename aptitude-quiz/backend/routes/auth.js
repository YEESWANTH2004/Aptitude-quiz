// const express = require('express');
// const router = express.Router();
// const { register, login, logout, refresh, getMe, createAdmin } = require('../controllers/authController');
// const { protect } = require('../middleware/auth');

// router.post('/register', register);
// router.post('/login', login);
// router.post('/logout', protect, logout);
// router.post('/refresh', refresh);
// router.get('/me', protect, getMe);
// router.post('/setup-admin', createAdmin); // One-time admin setup

// module.exports = router;


const express = require('express');
const router = express.Router();
const { candidateLogin, login, logout, refresh, getMe, createAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/candidate-login', candidateLogin); // Candidates: name + email only
router.post('/login', login);                    // Admin: email + password
router.post('/logout', protect, logout);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.post('/setup-admin', createAdmin);

module.exports = router;