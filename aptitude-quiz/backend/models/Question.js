const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq', 'true_false', 'open_ended', 'fill_blank'],
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: [{
    label: String, // A, B, C, D
    text: String,
  }],
  correctAnswer: {
    type: String, // option label for MCQ, 'true'/'false' for TF, text for FIB
  },
  explanation: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
