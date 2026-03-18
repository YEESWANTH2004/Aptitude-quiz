require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Question = require('../models/Question');
const QuizSession = require('../models/QuizSession');
const { customAlphabet } = require('nanoid');

const generateCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // Clear existing
  await Promise.all([User.deleteMany(), Question.deleteMany(), QuizSession.deleteMany()]);
  console.log('Cleared existing data');

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@quiz.com',
    password: 'Admin@123',
    role: 'admin',
  });

  // Create candidate
  await User.create({
    name: 'Test Candidate',
    email: 'candidate@quiz.com',
    password: 'Test@123',
    role: 'candidate',
  });

  // Create questions
  const questions = await Question.insertMany([
    {
      type: 'mcq',
      text: 'If a train travels 120 km in 2 hours, what is its average speed?',
      options: [
        { label: 'A', text: '40 km/h' },
        { label: 'B', text: '60 km/h' },
        { label: 'C', text: '80 km/h' },
        { label: 'D', text: '100 km/h' },
      ],
      correctAnswer: 'B',
      explanation: 'Speed = Distance / Time = 120 / 2 = 60 km/h',
      tags: ['Quantitative', 'Speed'],
      difficulty: 'easy',
      createdBy: admin._id,
    },
    {
      type: 'mcq',
      text: 'What is 15% of 200?',
      options: [
        { label: 'A', text: '25' },
        { label: 'B', text: '30' },
        { label: 'C', text: '35' },
        { label: 'D', text: '40' },
      ],
      correctAnswer: 'B',
      explanation: '15% of 200 = (15/100) × 200 = 30',
      tags: ['Quantitative', 'Percentage'],
      difficulty: 'easy',
      createdBy: admin._id,
    },
    {
      type: 'true_false',
      text: 'The square root of 144 is 12.',
      correctAnswer: 'true',
      explanation: '√144 = 12',
      tags: ['Quantitative', 'Mathematics'],
      difficulty: 'easy',
      createdBy: admin._id,
    },
    {
      type: 'true_false',
      text: 'All mammals are warm-blooded animals.',
      correctAnswer: 'true',
      explanation: 'Mammals are endothermic (warm-blooded) vertebrates.',
      tags: ['General Knowledge'],
      difficulty: 'easy',
      createdBy: admin._id,
    },
    {
      type: 'fill_blank',
      text: 'The next number in the series 2, 4, 8, 16, ___ is',
      correctAnswer: '32',
      explanation: 'Each number is doubled: 2×2=4, 4×2=8, 8×2=16, 16×2=32',
      tags: ['Logical', 'Series'],
      difficulty: 'medium',
      createdBy: admin._id,
    },
    {
      type: 'fill_blank',
      text: 'If the ratio of boys to girls in a class is 3:2 and there are 30 students total, there are ___ boys.',
      correctAnswer: '18',
      explanation: 'Boys = (3/5) × 30 = 18',
      tags: ['Quantitative', 'Ratio'],
      difficulty: 'medium',
      createdBy: admin._id,
    },
    {
      type: 'open_ended',
      text: 'Explain the concept of opportunity cost with an example.',
      tags: ['Economics', 'Verbal'],
      difficulty: 'medium',
      createdBy: admin._id,
    },
    {
      type: 'mcq',
      text: 'A man walks 5 km north, then 12 km east. How far is he from his starting point?',
      options: [
        { label: 'A', text: '13 km' },
        { label: 'B', text: '15 km' },
        { label: 'C', text: '17 km' },
        { label: 'D', text: '11 km' },
      ],
      correctAnswer: 'A',
      explanation: 'Using Pythagorean theorem: √(5² + 12²) = √(25 + 144) = √169 = 13 km',
      tags: ['Logical', 'Geometry'],
      difficulty: 'medium',
      createdBy: admin._id,
    },
  ]);

  // Create session
  await QuizSession.create({
    name: 'General Aptitude Test - Demo',
    description: 'A sample aptitude test covering quantitative, logical, and verbal skills.',
    questions: questions.map(q => q._id),
    timeLimit: 30,
    maxAttempts: 2,
    sessionCode: 'DEMO01',
    isActive: true,
    createdBy: admin._id,
  });

  console.log('✅ Seed complete!');
  console.log('Admin: admin@quiz.com / Admin@123');
  console.log('Candidate: candidate@quiz.com / Test@123');
  console.log('Session Code: DEMO01');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
