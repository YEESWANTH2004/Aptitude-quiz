// const Attempt = require('../models/Attempt');
// const QuizSession = require('../models/QuizSession');
// const Question = require('../models/Question');

// // @POST /api/attempts/start
// const startAttempt = async (req, res, next) => {
//   try {
//     const { sessionCode, passcode } = req.body;

//     const session = await QuizSession.findOne({
//       sessionCode: sessionCode.toUpperCase(),
//       isActive: true,
//     }).populate('questions');

//     if (!session) return res.status(404).json({ error: 'Session not found or inactive.' });

//     // Check passcode
//     if (session.passcode && session.passcode !== passcode) {
//       return res.status(401).json({ error: 'Invalid passcode.' });
//     }

//     // Check date window
//     const now = new Date();
//     if (session.startDate && now < session.startDate) {
//       return res.status(400).json({ error: 'Quiz has not started yet.' });
//     }
//     if (session.endDate && now > session.endDate) {
//       return res.status(400).json({ error: 'Quiz has ended.' });
//     }

//     // Check max attempts
//     const previousAttempts = await Attempt.countDocuments({
//       user: req.user._id,
//       session: session._id,
//       status: { $in: ['SUBMITTED', 'TERMINATED', 'TIMED_OUT'] },
//     });

//     if (previousAttempts >= session.maxAttempts) {
//       return res.status(400).json({ error: 'Maximum attempts reached.' });
//     }

//     // Check for existing IN_PROGRESS attempt
//     const existingAttempt = await Attempt.findOne({
//       user: req.user._id,
//       session: session._id,
//       status: 'IN_PROGRESS',
//     });

//     if (existingAttempt) {
//       // Check if expired
//       if (new Date() > existingAttempt.expiresAt) {
//         existingAttempt.status = 'TIMED_OUT';
//         await existingAttempt.save();
//       } else {
//         // Resume existing attempt — return without answers/correctAnswer
//         const safeSession = {
//           ...session.toObject(),
//           questions: session.questions.map(q => ({
//             _id: q._id,
//             text: q.text,
//             type: q.type,
//             options: q.options,
//           })),
//         };
//         return res.json({ attempt: existingAttempt, session: safeSession, resumed: true });
//       }
//     }

//     const expiresAt = new Date(Date.now() + session.timeLimit * 60 * 1000);

//     const attempt = await Attempt.create({
//       user: req.user._id,
//       session: session._id,
//       totalQuestions: session.questions.length,
//       expiresAt,
//       answers: [],
//     });

//     // Strip correct answers from questions
//     const safeQuestions = session.questions.map(q => ({
//       _id: q._id,
//       text: q.text,
//       type: q.type,
//       options: q.options,
//     }));

//     res.status(201).json({
//       attempt,
//       session: { ...session.toObject(), questions: safeQuestions },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // @POST /api/attempts/:id/answer
// const submitAnswer = async (req, res, next) => {
//   try {
//     const { questionId, selectedAnswer } = req.body;
//     const attempt = await Attempt.findById(req.params.id);

//     if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
//     if (attempt.user.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ error: 'Forbidden.' });
//     }
//     if (attempt.status !== 'IN_PROGRESS') {
//       return res.status(400).json({ error: `Attempt is ${attempt.status}.` });
//     }

//     // Check expiry
//     if (new Date() > attempt.expiresAt) {
//       attempt.status = 'TIMED_OUT';
//       await attempt.save();
//       return res.status(400).json({ error: 'Time expired.' });
//     }

//     // Update or add answer
//     const existingAnswerIndex = attempt.answers.findIndex(
//       a => a.question.toString() === questionId
//     );

//     const question = await Question.findById(questionId);
//     if (!question) return res.status(404).json({ error: 'Question not found.' });

//     let isCorrect = false;
//     if (question.type !== 'open_ended') {
//       isCorrect = question.correctAnswer?.toLowerCase().trim() === selectedAnswer?.toLowerCase().trim();
//     }

//     const answerData = {
//       question: questionId,
//       selectedAnswer,
//       isCorrect,
//       answeredAt: new Date(),
//     };

//     if (existingAnswerIndex >= 0) {
//       attempt.answers[existingAnswerIndex] = answerData;
//     } else {
//       attempt.answers.push(answerData);
//     }

//     await attempt.save();
//     res.json({ message: 'Answer saved.', isCorrect: question.type !== 'open_ended' ? isCorrect : null });
//   } catch (err) {
//     next(err);
//   }
// };

// // @POST /api/attempts/:id/submit
// const submitAttempt = async (req, res, next) => {
//   try {
//     const attempt = await Attempt.findById(req.params.id);
//     if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
//     if (attempt.user.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ error: 'Forbidden.' });
//     }
//     if (attempt.status !== 'IN_PROGRESS') {
//       return res.status(400).json({ error: `Attempt already ${attempt.status}.` });
//     }

//     const score = attempt.answers.filter(a => a.isCorrect).length;
//     attempt.score = score;
//     attempt.status = 'SUBMITTED';
//     attempt.submittedAt = new Date();
//     await attempt.save();

//     // Notify admin via socket
//     const io = req.app.get('io');
//     const session = await QuizSession.findById(attempt.session);
//     if (session) {
//       io.to(`admin-${session.createdBy}`).emit('attempt-submitted', {
//         attemptId: attempt._id,
//         userId: attempt.user,
//         score,
//         total: attempt.totalQuestions,
//       });
//     }

//     res.json({ message: 'Quiz submitted successfully.', score, total: attempt.totalQuestions });
//   } catch (err) {
//     next(err);
//   }
// };

// // @POST /api/attempts/:id/terminate  ← ANTI-CHEAT
// const terminateAttempt = async (req, res, next) => {
//   try {
//     const { reason } = req.body;
//     const attempt = await Attempt.findById(req.params.id);

//     if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
//     if (attempt.user.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ error: 'Forbidden.' });
//     }
//     if (attempt.status !== 'IN_PROGRESS') {
//       return res.status(400).json({ error: `Attempt already ${attempt.status}.` });
//     }

//     // Auto-score what was answered
//     const score = attempt.answers.filter(a => a.isCorrect).length;
//     attempt.score = score;
//     attempt.status = 'TERMINATED';
//     attempt.submittedAt = new Date();
//     attempt.violations.push({ reason: reason || 'TAB_SWITCH', timestamp: new Date() });
//     await attempt.save();

//     // Notify admin
//     const io = req.app.get('io');
//     const session = await QuizSession.findById(attempt.session);
//     if (session) {
//       io.to(`admin-${session.createdBy}`).emit('attempt-terminated', {
//         attemptId: attempt._id,
//         userId: attempt.user,
//         reason,
//       });
//     }

//     res.json({ message: 'Attempt terminated due to violation.' });
//   } catch (err) {
//     next(err);
//   }
// };

// // @GET /api/attempts/:id/result
// const getResult = async (req, res, next) => {
//   try {
//     const attempt = await Attempt.findById(req.params.id)
//       .populate('session', 'name timeLimit')
//       .populate({
//         path: 'answers.question',
//         select: 'text type options correctAnswer explanation',
//       });

//     if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });

//     // Only owner or admin
//     if (
//       attempt.user.toString() !== req.user._id.toString() &&
//       req.user.role !== 'admin'
//     ) {
//       return res.status(403).json({ error: 'Forbidden.' });
//     }

//     if (attempt.status === 'IN_PROGRESS') {
//       return res.status(400).json({ error: 'Quiz not yet submitted.' });
//     }

//     res.json({ attempt });
//   } catch (err) {
//     next(err);
//   }
// };

// // @GET /api/attempts — admin: all attempts
// const getAllAttempts = async (req, res, next) => {
//   try {
//     const { sessionId, userId, status } = req.query;
//     const filter = {};
//     if (sessionId) filter.session = sessionId;
//     if (userId) filter.user = userId;
//     if (status) filter.status = status;

//     const attempts = await Attempt.find(filter)
//       .populate('user', 'name email')
//       .populate('session', 'name sessionCode')
//       .sort('-createdAt')
//       .limit(100);

//     res.json({ attempts });
//   } catch (err) {
//     next(err);
//   }
// };

// // @GET /api/attempts/my — candidate's own attempts
// const getMyAttempts = async (req, res, next) => {
//   try {
//     const attempts = await Attempt.find({ user: req.user._id })
//       .populate('session', 'name sessionCode timeLimit')
//       .sort('-createdAt');
//     res.json({ attempts });
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = {
//   startAttempt,
//   submitAnswer,
//   submitAttempt,
//   terminateAttempt,
//   getResult,
//   getAllAttempts,
//   getMyAttempts,
// };


const Attempt = require('../models/Attempt');
const QuizSession = require('../models/QuizSession');
const Question = require('../models/Question');

// @POST /api/attempts/start
const startAttempt = async (req, res, next) => {
  try {
    const { sessionCode, passcode } = req.body;

    const session = await QuizSession.findOne({
      sessionCode: sessionCode.toUpperCase(),
      isActive: true,
    }).populate('questions');

    if (!session) return res.status(404).json({ error: 'Session not found or inactive.' });

    if (session.passcode && session.passcode !== passcode) {
      return res.status(401).json({ error: 'Invalid passcode.' });
    }

    const now = new Date();
    if (session.startDate && now < session.startDate) {
      return res.status(400).json({ error: 'Quiz has not started yet.' });
    }
    if (session.endDate && now > session.endDate) {
      return res.status(400).json({ error: 'Quiz has ended.' });
    }

    const previousAttempts = await Attempt.countDocuments({
      user: req.user._id,
      session: session._id,
      status: { $in: ['SUBMITTED', 'TERMINATED', 'TIMED_OUT'] },
    });

    if (previousAttempts >= session.maxAttempts) {
      return res.status(400).json({ error: 'Maximum attempts reached.' });
    }

    const existingAttempt = await Attempt.findOne({
      user: req.user._id,
      session: session._id,
      status: 'IN_PROGRESS',
    });

    if (existingAttempt) {
      if (new Date() > existingAttempt.expiresAt) {
        existingAttempt.status = 'TIMED_OUT';
        await existingAttempt.save();
      } else {
        const safeSession = {
          ...session.toObject(),
          questions: session.questions.map(q => ({
            _id: q._id, text: q.text, type: q.type, options: q.options,
          })),
        };
        return res.json({ attempt: existingAttempt, session: safeSession, resumed: true });
      }
    }

    const expiresAt = new Date(Date.now() + session.timeLimit * 60 * 1000);
    const attempt = await Attempt.create({
      user: req.user._id,
      session: session._id,
      totalQuestions: session.questions.length,
      expiresAt,
      answers: [],
    });

    const safeQuestions = session.questions.map(q => ({
      _id: q._id, text: q.text, type: q.type, options: q.options,
    }));

    // Notify admin via socket that a new attempt started
    const io = req.app.get('io');
    io.to(`admin-${session.createdBy}`).emit('attempt-started', {
      attemptId: attempt._id,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      sessionId: session._id,
    });

    res.status(201).json({
      attempt,
      session: { ...session.toObject(), questions: safeQuestions },
    });
  } catch (err) {
    next(err);
  }
};

// @POST /api/attempts/:id/answer
const submitAnswer = async (req, res, next) => {
  try {
    const { questionId, selectedAnswer } = req.body;
    const attempt = await Attempt.findById(req.params.id);

    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
    if (attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden.' });
    }
    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: `Attempt is ${attempt.status}.` });
    }
    if (new Date() > attempt.expiresAt) {
      attempt.status = 'TIMED_OUT';
      await attempt.save();
      return res.status(400).json({ error: 'Time expired.' });
    }

    const existingAnswerIndex = attempt.answers.findIndex(
      a => a.question.toString() === questionId
    );

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found.' });

    let isCorrect = false;
    if (question.type !== 'open_ended') {
      isCorrect = question.correctAnswer?.toLowerCase().trim() === selectedAnswer?.toLowerCase().trim();
    }

    const answerData = {
      question: questionId,
      selectedAnswer,
      isCorrect,
      answeredAt: new Date(),
    };

    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      attempt.answers.push(answerData);
    }

    await attempt.save();
    res.json({ message: 'Answer saved.', isCorrect: question.type !== 'open_ended' ? isCorrect : null });
  } catch (err) {
    next(err);
  }
};

// @POST /api/attempts/:id/submit
const submitAttempt = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
    if (attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden.' });
    }
    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: `Attempt already ${attempt.status}.` });
    }

    const score = attempt.answers.filter(a => a.isCorrect).length;
    attempt.score = score;
    attempt.status = 'SUBMITTED';
    attempt.submittedAt = new Date();
    await attempt.save();

    const io = req.app.get('io');
    const session = await QuizSession.findById(attempt.session);
    if (session) {
      io.to(`admin-${session.createdBy}`).emit('attempt-submitted', {
        attemptId: attempt._id,
        userId: attempt.user,
        score,
        total: attempt.totalQuestions,
      });
    }

    res.json({ message: 'Quiz submitted successfully.', score, total: attempt.totalQuestions });
  } catch (err) {
    next(err);
  }
};

// @POST /api/attempts/:id/terminate  ← candidate self-terminates (tab switch)
const terminateAttempt = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const attempt = await Attempt.findById(req.params.id);

    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
    if (attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden.' });
    }
    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: `Attempt already ${attempt.status}.` });
    }

    const score = attempt.answers.filter(a => a.isCorrect).length;
    attempt.score = score;
    attempt.status = 'TERMINATED';
    attempt.submittedAt = new Date();
    attempt.violations.push({ reason: reason || 'TAB_SWITCH', timestamp: new Date() });
    await attempt.save();

    const io = req.app.get('io');
    const session = await QuizSession.findById(attempt.session);
    if (session) {
      io.to(`admin-${session.createdBy}`).emit('attempt-terminated', {
        attemptId: attempt._id,
        userId: attempt.user,
        reason,
      });
    }

    res.json({ message: 'Attempt terminated due to violation.' });
  } catch (err) {
    next(err);
  }
};

// @POST /api/attempts/:id/admin-terminate  ← admin force-terminates
const adminTerminateAttempt = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id).populate('user', 'name email');

    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: `Attempt already ${attempt.status}.` });
    }

    const score = attempt.answers.filter(a => a.isCorrect).length;
    attempt.score = score;
    attempt.status = 'TERMINATED';
    attempt.submittedAt = new Date();
    attempt.violations.push({ reason: 'ADMIN_TERMINATED', timestamp: new Date() });
    await attempt.save();

    // Emit to the specific candidate's quiz page via socket
    const io = req.app.get('io');
    io.to(`attempt-${attempt._id}`).emit('force-terminated', {
      reason: 'ADMIN_TERMINATED',
      message: 'Your session has been terminated by the administrator.',
    });

    // Also notify admin dashboard
    const session = await QuizSession.findById(attempt.session);
    if (session) {
      io.to(`admin-${session.createdBy}`).emit('attempt-terminated', {
        attemptId: attempt._id,
        userId: attempt.user._id,
        reason: 'ADMIN_TERMINATED',
      });
    }

    res.json({ message: `Attempt for ${attempt.user.name} terminated successfully.` });
  } catch (err) {
    next(err);
  }
};

// @GET /api/attempts/:id/result
const getResult = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('session', 'name timeLimit')
      .populate({
        path: 'answers.question',
        select: 'text type options correctAnswer explanation',
      });

    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });

    if (
      attempt.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    if (attempt.status === 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Quiz not yet submitted.' });
    }

    res.json({ attempt });
  } catch (err) {
    next(err);
  }
};

// @GET /api/attempts — admin: all attempts
const getAllAttempts = async (req, res, next) => {
  try {
    const { sessionId, userId, status } = req.query;
    const filter = {};
    if (sessionId) filter.session = sessionId;
    if (userId) filter.user = userId;
    if (status) filter.status = status;

    const attempts = await Attempt.find(filter)
      .populate('user', 'name email')
      .populate('session', 'name sessionCode')
      .sort('-createdAt')
      .limit(100);

    res.json({ attempts });
  } catch (err) {
    next(err);
  }
};

// @GET /api/attempts/my — candidate's own attempts
const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id })
      .populate('session', 'name sessionCode timeLimit')
      .sort('-createdAt');
    res.json({ attempts });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  startAttempt,
  submitAnswer,
  submitAttempt,
  terminateAttempt,
  adminTerminateAttempt,
  getResult,
  getAllAttempts,
  getMyAttempts,
};
