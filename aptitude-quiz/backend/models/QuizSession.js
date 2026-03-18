const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Session name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  }],
  timeLimit: {
    type: Number, // in minutes
    required: true,
    min: 1,
  },
  maxAttempts: {
    type: Number,
    default: 1,
    min: 1,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  passcode: {
    type: String,
    trim: true,
  },
  sessionCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('QuizSession', quizSessionSchema);
