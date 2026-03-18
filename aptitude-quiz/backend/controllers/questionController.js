const Question = require('../models/Question');

// @GET /api/questions
const getQuestions = async (req, res, next) => {
  try {
    const { type, difficulty, tags, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (search) filter.text = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const [questions, total] = await Promise.all([
      Question.find(filter).populate('createdBy', 'name').skip(skip).limit(Number(limit)).sort('-createdAt'),
      Question.countDocuments(filter),
    ]);

    res.json({ questions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// @POST /api/questions
const createQuestion = async (req, res, next) => {
  try {
    const question = await Question.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ question });
  } catch (err) {
    next(err);
  }
};

// @PUT /api/questions/:id
const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!question) return res.status(404).json({ error: 'Question not found.' });
    res.json({ question });
  } catch (err) {
    next(err);
  }
};

// @DELETE /api/questions/:id
const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found.' });
    res.json({ message: 'Question deleted.' });
  } catch (err) {
    next(err);
  }
};

// @GET /api/questions/:id
const getQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found.' });
    res.json({ question });
  } catch (err) {
    next(err);
  }
};

module.exports = { getQuestions, createQuestion, updateQuestion, deleteQuestion, getQuestion };
