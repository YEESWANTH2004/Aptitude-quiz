// const QuizSession = require('../models/QuizSession');
// const { customAlphabet } = require('nanoid');

// const generateCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

// // @GET /api/sessions
// const getSessions = async (req, res, next) => {
//   try {
//     const sessions = await QuizSession.find({ createdBy: req.user._id })
//       .populate('questions', 'text type difficulty')
//       .sort('-createdAt');
//     res.json({ sessions });
//   } catch (err) {
//     next(err);
//   }
// };

// // @POST /api/sessions
// const createSession = async (req, res, next) => {
//   try {
//     let sessionCode;
//     let exists = true;
//     while (exists) {
//       sessionCode = generateCode();
//       exists = await QuizSession.findOne({ sessionCode });
//     }

//     const session = await QuizSession.create({
//       ...req.body,
//       sessionCode,
//       createdBy: req.user._id,
//     });

//     res.status(201).json({ session });
//   } catch (err) {
//     next(err);
//   }
// };

// // @GET /api/sessions/code/:code
// const getSessionByCode = async (req, res, next) => {
//   try {
//     const session = await QuizSession.findOne({
//       sessionCode: req.params.code.toUpperCase(),
//       isActive: true,
//     }).populate('questions', 'text type options -correctAnswer'); // Don't expose answers

//     if (!session) return res.status(404).json({ error: 'Session not found or inactive.' });

//     // Check date window
//     const now = new Date();
//     if (session.startDate && now < session.startDate) {
//       return res.status(400).json({ error: 'Quiz has not started yet.' });
//     }
//     if (session.endDate && now > session.endDate) {
//       return res.status(400).json({ error: 'Quiz has ended.' });
//     }

//     res.json({ session });
//   } catch (err) {
//     next(err);
//   }
// };

// // @GET /api/sessions/:id
// const getSession = async (req, res, next) => {
//   try {
//     const session = await QuizSession.findById(req.params.id)
//       .populate('questions')
//       .populate('createdBy', 'name');
//     if (!session) return res.status(404).json({ error: 'Session not found.' });
//     res.json({ session });
//   } catch (err) {
//     next(err);
//   }
// };

// // @PUT /api/sessions/:id
// const updateSession = async (req, res, next) => {
//   try {
//     const session = await QuizSession.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!session) return res.status(404).json({ error: 'Session not found.' });
//     res.json({ session });
//   } catch (err) {
//     next(err);
//   }
// };

// // @DELETE /api/sessions/:id
// const deleteSession = async (req, res, next) => {
//   try {
//     const session = await QuizSession.findByIdAndDelete(req.params.id);
//     if (!session) return res.status(404).json({ error: 'Session not found.' });
//     res.json({ message: 'Session deleted.' });
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = { getSessions, createSession, getSessionByCode, getSession, updateSession, deleteSession };

const QuizSession = require('../models/QuizSession');
const { customAlphabet } = require('nanoid');

const generateCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

// @GET /api/sessions
const getSessions = async (req, res, next) => {
  try {
    const sessions = await QuizSession.find({ createdBy: req.user._id })
      .populate('questions', 'text type difficulty')
      .sort('-createdAt');
    res.json({ sessions });
  } catch (err) {
    next(err);
  }
};

// @POST /api/sessions
const createSession = async (req, res, next) => {
  try {
    let sessionCode;
    let exists = true;
    while (exists) {
      sessionCode = generateCode();
      exists = await QuizSession.findOne({ sessionCode });
    }

    const session = await QuizSession.create({
      ...req.body,
      sessionCode,
      createdBy: req.user._id,
    });

    res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
};

// @GET /api/sessions/code/:code
const getSessionByCode = async (req, res, next) => {
  try {
    const session = await QuizSession.findOne({
      sessionCode: req.params.code.toUpperCase(),
      isActive: true,
    }).populate('questions', 'text type options difficulty');

    if (!session) return res.status(404).json({ error: 'Session not found or inactive.' });

    // Check date window
    const now = new Date();
    if (session.startDate && now < session.startDate) {
      return res.status(400).json({ error: 'Quiz has not started yet.' });
    }
    if (session.endDate && now > session.endDate) {
      return res.status(400).json({ error: 'Quiz has ended.' });
    }

    // Strip correct answers before sending to client
    const safeSession = session.toObject();
    safeSession.questions = safeSession.questions.map(q => {
      const { correctAnswer, ...safe } = q;
      return safe;
    });

    res.json({ session: safeSession });
  } catch (err) {
    next(err);
  }
};

// @GET /api/sessions/:id
const getSession = async (req, res, next) => {
  try {
    const session = await QuizSession.findById(req.params.id)
      .populate('questions')
      .populate('createdBy', 'name');
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json({ session });
  } catch (err) {
    next(err);
  }
};

// @PUT /api/sessions/:id
const updateSession = async (req, res, next) => {
  try {
    const session = await QuizSession.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json({ session });
  } catch (err) {
    next(err);
  }
};

// @DELETE /api/sessions/:id
const deleteSession = async (req, res, next) => {
  try {
    const session = await QuizSession.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json({ message: 'Session deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSessions, createSession, getSessionByCode, getSession, updateSession, deleteSession };