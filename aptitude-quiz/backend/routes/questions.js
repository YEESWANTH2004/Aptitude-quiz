const express = require('express');
const router = express.Router();
const {
  getQuestions, createQuestion, updateQuestion, deleteQuestion, getQuestion
} = require('../controllers/questionController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', getQuestions);
router.get('/:id', getQuestion);
router.post('/', adminOnly, createQuestion);
router.put('/:id', adminOnly, updateQuestion);
router.delete('/:id', adminOnly, deleteQuestion);

module.exports = router;
