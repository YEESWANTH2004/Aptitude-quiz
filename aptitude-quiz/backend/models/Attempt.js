const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizSession',
    required: true,
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    },
    selectedAnswer: String,
    isCorrect: Boolean,
    answeredAt: Date,
  }],
  score: {
    type: Number,
    default: 0,
  },
  totalQuestions: {
    type: Number,
    default: 0,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  submittedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date, // startedAt + timeLimit
    required: true,
  },
  status: {
    type: String,
    enum: ['IN_PROGRESS', 'SUBMITTED', 'TERMINATED', 'TIMED_OUT'],
    default: 'IN_PROGRESS',
  },
  violations: [{
    reason: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  currentQuestionIndex: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Attempt', attemptSchema);
