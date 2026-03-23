// // // const jwt = require('jsonwebtoken');
// // // const User = require('../models/User');

// // // const generateTokens = (userId) => {
// // //   const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
// // //     expiresIn: '15m',
// // //   });
// // //   const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
// // //     expiresIn: '7d',
// // //   });
// // //   return { accessToken, refreshToken };
// // // };

// // // const cookieOptions = {
// // //   httpOnly: true,
// // //   secure: process.env.NODE_ENV === 'production',
// // //   sameSite: 'strict',
// // // };

// // // // @POST /api/auth/register
// // // const register = async (req, res, next) => {
// // //   try {
// // //     const { name, email, password, role } = req.body;

// // //     const existingUser = await User.findOne({ email });
// // //     if (existingUser) {
// // //       return res.status(400).json({ error: 'Email already registered.' });
// // //     }

// // //     // Only allow admin creation if no admin exists OR via existing admin
// // //     const assignedRole = role === 'admin' ? 'candidate' : (role || 'candidate');

// // //     const user = await User.create({ name, email, password, role: assignedRole });
// // //     const { accessToken, refreshToken } = generateTokens(user._id);

// // //     user.refreshToken = refreshToken;
// // //     await user.save({ validateBeforeSave: false });

// // //     res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
// // //     res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

// // //     res.status(201).json({
// // //       user: { _id: user._id, name: user.name, email: user.email, role: user.role },
// // //       accessToken,
// // //     });
// // //   } catch (err) {
// // //     next(err);
// // //   }
// // // };

// // // // @POST /api/auth/login
// // // const login = async (req, res, next) => {
// // //   try {
// // //     const { email, password } = req.body;

// // //     const user = await User.findOne({ email }).select('+password +refreshToken');
// // //     if (!user || !(await user.comparePassword(password))) {
// // //       return res.status(401).json({ error: 'Invalid email or password.' });
// // //     }

// // //     const { accessToken, refreshToken } = generateTokens(user._id);
// // //     user.refreshToken = refreshToken;
// // //     await user.save({ validateBeforeSave: false });

// // //     res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
// // //     res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

// // //     res.json({
// // //       user: { _id: user._id, name: user.name, email: user.email, role: user.role },
// // //       accessToken,
// // //     });
// // //   } catch (err) {
// // //     next(err);
// // //   }
// // // };

// // // // @POST /api/auth/refresh
// // // const refresh = async (req, res, next) => {
// // //   try {
// // //     const token = req.cookies?.refreshToken || req.body?.refreshToken;
// // //     if (!token) return res.status(401).json({ error: 'No refresh token.' });

// // //     const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
// // //     const user = await User.findById(decoded.id).select('+refreshToken');

// // //     if (!user || user.refreshToken !== token) {
// // //       return res.status(401).json({ error: 'Invalid refresh token.' });
// // //     }

// // //     const { accessToken, refreshToken } = generateTokens(user._id);
// // //     user.refreshToken = refreshToken;
// // //     await user.save({ validateBeforeSave: false });

// // //     res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
// // //     res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

// // //     res.json({ accessToken });
// // //   } catch (err) {
// // //     next(err);
// // //   }
// // // };

// // // // @POST /api/auth/logout
// // // const logout = async (req, res, next) => {
// // //   try {
// // //     if (req.user) {
// // //       await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
// // //     }
// // //     res.clearCookie('accessToken');
// // //     res.clearCookie('refreshToken');
// // //     res.json({ message: 'Logged out successfully.' });
// // //   } catch (err) {
// // //     next(err);
// // //   }
// // // };

// // // // @GET /api/auth/me
// // // const getMe = async (req, res) => {
// // //   res.json({ user: req.user });
// // // };

// // // // @POST /api/auth/create-admin (setup only)
// // // const createAdmin = async (req, res, next) => {
// // //   try {
// // //     const adminExists = await User.findOne({ role: 'admin' });
// // //     if (adminExists) {
// // //       return res.status(400).json({ error: 'Admin already exists.' });
// // //     }
// // //     const { name, email, password } = req.body;
// // //     const admin = await User.create({ name, email, password, role: 'admin' });
// // //     res.status(201).json({ message: 'Admin created.', email: admin.email });
// // //   } catch (err) {
// // //     next(err);
// // //   }
// // // };

// // // module.exports = { register, login, logout, refresh, getMe, createAdmin };



// // const jwt = require('jsonwebtoken');
// // const User = require('../models/User');

// // const generateTokens = (userId) => {
// //   const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
// //     expiresIn: '15m',
// //   });
// //   const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
// //     expiresIn: '7d',
// //   });
// //   return { accessToken, refreshToken };
// // };

// // const cookieOptions = {
// //   httpOnly: true,
// //   secure: process.env.NODE_ENV === 'production',
// //   sameSite: 'strict',
// // };

// // // @POST /api/auth/candidate-login
// // // Candidate login: just name + email, no password needed
// // const candidateLogin = async (req, res, next) => {
// //   try {
// //     const { name, email } = req.body;

// //     if (!name || !email) {
// //       return res.status(400).json({ error: 'Name and email are required.' });
// //     }

// //     // Find or create candidate by email
// //     let user = await User.findOne({ email: email.toLowerCase().trim() });

// //     if (user) {
// //       // Existing user — update name if changed, ensure they are a candidate
// //       if (user.role === 'admin') {
// //         return res.status(403).json({ error: 'Use the admin login instead.' });
// //       }
// //       if (user.name !== name.trim()) {
// //         user.name = name.trim();
// //         await user.save({ validateBeforeSave: false });
// //       }
// //     } else {
// //       // New candidate — auto-register them
// //       user = await User.create({
// //         name: name.trim(),
// //         email: email.toLowerCase().trim(),
// //         role: 'candidate',
// //       });
// //     }

// //     const { accessToken, refreshToken } = generateTokens(user._id);
// //     user.refreshToken = refreshToken;
// //     await user.save({ validateBeforeSave: false });

// //     res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
// //     res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

// //     res.json({
// //       user: { _id: user._id, name: user.name, email: user.email, role: user.role },
// //       accessToken,
// //     });
// //   } catch (err) {
// //     next(err);
// //   }
// // };

// // // @POST /api/auth/login  (Admin only - uses password)
// // const login = async (req, res, next) => {
// //   try {
// //     const { email, password } = req.body;

// //     if (!email || !password) {
// //       return res.status(400).json({ error: 'Email and password are required.' });
// //     }

// //     const user = await User.findOne({ email }).select('+password +refreshToken');

// //     if (!user) {
// //       return res.status(401).json({ error: 'Invalid email or password.' });
// //     }

// //     // Candidates use /candidate-login, not this route
// //     if (user.role !== 'admin') {
// //       return res.status(400).json({ error: 'Candidates do not use a password. Use the candidate login.' });
// //     }

// //     if (!user.password || !(await user.comparePassword(password))) {
// //       return res.status(401).json({ error: 'Invalid email or password.' });
// //     }

// //     const { accessToken, refreshToken } = generateTokens(user._id);
// //     user.refreshToken = refreshToken;
// //     await user.save({ validateBeforeSave: false });

// //     res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
// //     res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

// //     res.json({
// //       user: { _id: user._id, name: user.name, email: user.email, role: user.role },
// //       accessToken,
// //     });
// //   } catch (err) {
// //     next(err);
// //   }
// // };

// // // @POST /api/auth/refresh
// // const refresh = async (req, res, next) => {
// //   try {
// //     const token = req.cookies?.refreshToken || req.body?.refreshToken;
// //     if (!token) return res.status(401).json({ error: 'No refresh token.' });

// //     const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
// //     const user = await User.findById(decoded.id).select('+refreshToken');

// //     if (!user || user.refreshToken !== token) {
// //       return res.status(401).json({ error: 'Invalid refresh token.' });
// //     }

// //     const { accessToken, refreshToken } = generateTokens(user._id);
// //     user.refreshToken = refreshToken;
// //     await user.save({ validateBeforeSave: false });

// //     res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
// //     res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

// //     res.json({ accessToken });
// //   } catch (err) {
// //     next(err);
// //   }
// // };

// // // @POST /api/auth/logout
// // const logout = async (req, res, next) => {
// //   try {
// //     if (req.user) {
// //       await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
// //     }
// //     res.clearCookie('accessToken');
// //     res.clearCookie('refreshToken');
// //     res.json({ message: 'Logged out successfully.' });
// //   } catch (err) {
// //     next(err);
// //   }
// // };

// // // @GET /api/auth/me
// // const getMe = async (req, res) => {
// //   res.json({ user: req.user });
// // };

// // // @POST /api/auth/setup-admin (one-time setup)
// // const createAdmin = async (req, res, next) => {
// //   try {
// //     const adminExists = await User.findOne({ role: 'admin' });
// //     if (adminExists) {
// //       return res.status(400).json({ error: 'Admin already exists.' });
// //     }
// //     const { name, email, password } = req.body;
// //     const admin = await User.create({ name, email, password, role: 'admin' });
// //     res.status(201).json({ message: 'Admin created.', email: admin.email });
// //   } catch (err) {
// //     next(err);
// //   }
// // };

// // module.exports = { candidateLogin, login, logout, refresh, getMe, createAdmin };


// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const generateTokens = (userId) => {
//   const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//     expiresIn: '15m',
//   });
//   const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
//     expiresIn: '7d',
//   });
//   return { accessToken, refreshToken };
// };

// const cookieOptions = {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === 'production',
//   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
// };

// // @POST /api/auth/candidate-login
// // Candidate login: just name + email, no password needed
// const candidateLogin = async (req, res, next) => {
//   try {
//     const { name, email } = req.body;

//     if (!name || !email) {
//       return res.status(400).json({ error: 'Name and email are required.' });
//     }

//     const trimmedEmail = email.toLowerCase().trim();
//     const trimmedName = name.trim();

//     // Find or auto-create candidate
//     let user = await User.findOne({ email: trimmedEmail });

//     if (user) {
//       if (user.role === 'admin') {
//         return res.status(403).json({ error: 'Use the admin login instead.' });
//       }
//       // Update name if changed
//       if (user.name !== trimmedName) {
//         user.name = trimmedName;
//       }
//     } else {
//       // New candidate — auto-register
//       user = new User({
//         name: trimmedName,
//         email: trimmedEmail,
//         role: 'candidate',
//       });
//     }

//     const { accessToken, refreshToken } = generateTokens(user._id);
//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false });

//     res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
//     res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

//     res.json({
//       user: { _id: user._id, name: user.name, email: user.email, role: user.role },
//       accessToken,
//     });
//   } catch (err) {
//     console.error('candidateLogin error:', err);
//     next(err);
//   }
// };

// // @POST /api/auth/login  (Admin only - uses password)
// const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email and password are required.' });
//     }

//     const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password +refreshToken');

//     if (!user) {
//       return res.status(401).json({ error: 'Invalid email or password.' });
//     }

//     if (user.role !== 'admin') {
//       return res.status(400).json({ error: 'Candidates do not use a password. Use the candidate login.' });
//     }

//     if (!user.password || !(await user.comparePassword(password))) {
//       return res.status(401).json({ error: 'Invalid email or password.' });
//     }

//     const { accessToken, refreshToken } = generateTokens(user._id);
//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false });

//     res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
//     res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

//     res.json({
//       user: { _id: user._id, name: user.name, email: user.email, role: user.role },
//       accessToken,
//     });
//   } catch (err) {
//     console.error('login error:', err);
//     next(err);
//   }
// };

// // @POST /api/auth/refresh
// const refresh = async (req, res, next) => {
//   try {
//     const token = req.cookies?.refreshToken || req.body?.refreshToken;
//     if (!token) return res.status(401).json({ error: 'No refresh token.' });

//     const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
//     const user = await User.findById(decoded.id).select('+refreshToken');

//     if (!user || user.refreshToken !== token) {
//       return res.status(401).json({ error: 'Invalid refresh token.' });
//     }

//     const { accessToken, refreshToken } = generateTokens(user._id);
//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false });

//     res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
//     res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

//     res.json({ accessToken });
//   } catch (err) {
//     console.error('refresh error:', err);
//     next(err);
//   }
// };

// // @POST /api/auth/logout
// const logout = async (req, res, next) => {
//   try {
//     if (req.user) {
//       await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
//     }
//     res.clearCookie('accessToken');
//     res.clearCookie('refreshToken');
//     res.json({ message: 'Logged out successfully.' });
//   } catch (err) {
//     next(err);
//   }
// };

// // @GET /api/auth/me
// const getMe = async (req, res) => {
//   res.json({ user: req.user });
// };

// // @POST /api/auth/setup-admin
// const createAdmin = async (req, res, next) => {
//   try {
//     const adminExists = await User.findOne({ role: 'admin' });
//     if (adminExists) {
//       return res.status(400).json({ error: 'Admin already exists.' });
//     }
//     const { name, email, password } = req.body;
//     const admin = await User.create({ name, email, password, role: 'admin' });
//     res.status(201).json({ message: 'Admin created.', email: admin.email });
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = { candidateLogin, login, logout, refresh, getMe, createAdmin };


// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const generateTokens = (userId) => {
//   const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//     expiresIn: '2h',
//   });
//   const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
//     expiresIn: '7d',
//   });
//   return { accessToken, refreshToken };
// };

// // @POST /api/auth/candidate-login
// const candidateLogin = async (req, res, next) => {
//   try {
//     const { name, email } = req.body;

//     if (!name || !email) {
//       return res.status(400).json({ error: 'Name and email are required.' });
//     }

//     const trimmedEmail = email.toLowerCase().trim();
//     const trimmedName = name.trim();

//     let user = await User.findOne({ email: trimmedEmail });

//     if (user) {
//       if (user.role === 'admin') {
//         return res.status(403).json({ error: 'Use the admin login instead.' });
//       }
//       if (user.name !== trimmedName) {
//         user.name = trimmedName;
//       }
//     } else {
//       user = new User({
//         name: trimmedName,
//         email: trimmedEmail,
//         role: 'candidate',
//       });
//     }

//     const { accessToken, refreshToken } = generateTokens(user._id);
//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false });

//     // Return tokens in response body (not cookies) for cross-domain support
//     res.json({
//       user: { _id: user._id, name: user.name, email: user.email, role: user.role },
//       accessToken,
//       refreshToken,
//     });
//   } catch (err) {
//     console.error('candidateLogin error:', err);
//     next(err);
//   }
// };

// // @POST /api/auth/login (Admin)
// const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email and password are required.' });
//     }

//     const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password +refreshToken');

//     if (!user) {
//       return res.status(401).json({ error: 'Invalid email or password.' });
//     }

//     if (user.role !== 'admin') {
//       return res.status(400).json({ error: 'Candidates do not use a password. Use the candidate login.' });
//     }

//     if (!user.password || !(await user.comparePassword(password))) {
//       return res.status(401).json({ error: 'Invalid email or password.' });
//     }

//     const { accessToken, refreshToken } = generateTokens(user._id);
//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false });

//     res.json({
//       user: { _id: user._id, name: user.name, email: user.email, role: user.role },
//       accessToken,
//       refreshToken,
//     });
//   } catch (err) {
//     console.error('login error:', err);
//     next(err);
//   }
// };

// // @POST /api/auth/refresh
// const refresh = async (req, res, next) => {
//   try {
//     // Accept refresh token from body or header
//     const token = req.body?.refreshToken || req.headers['x-refresh-token'];

//     if (!token) return res.status(401).json({ error: 'No refresh token.' });

//     const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
//     const user = await User.findById(decoded.id).select('+refreshToken');

//     if (!user || user.refreshToken !== token) {
//       return res.status(401).json({ error: 'Invalid refresh token.' });
//     }

//     const { accessToken, refreshToken } = generateTokens(user._id);
//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false });

//     res.json({ accessToken, refreshToken });
//   } catch (err) {
//     console.error('refresh error:', err);
//     next(err);
//   }
// };

// // @POST /api/auth/logout
// const logout = async (req, res, next) => {
//   try {
//     if (req.user) {
//       await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
//     }
//     res.json({ message: 'Logged out successfully.' });
//   } catch (err) {
//     next(err);
//   }
// };

// // @GET /api/auth/me
// const getMe = async (req, res) => {
//   res.json({ user: req.user });
// };

// // @POST /api/auth/setup-admin
// const createAdmin = async (req, res, next) => {
//   try {
//     const adminExists = await User.findOne({ role: 'admin' });
//     if (adminExists) {
//       return res.status(400).json({ error: 'Admin already exists.' });
//     }
//     const { name, email, password } = req.body;
//     const admin = await User.create({ name, email, password, role: 'admin' });
//     res.status(201).json({ message: 'Admin created.', email: admin.email });
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = { candidateLogin, login, logout, refresh, getMe, createAdmin };

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
  return { accessToken, refreshToken };
};

// @POST /api/auth/candidate-login
const candidateLogin = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedName = name.trim();

    let user = await User.findOne({ email: trimmedEmail });

    if (user) {
      if (user.role === 'admin') {
        return res.status(403).json({ error: 'Use the admin login instead.' });
      }
      if (user.name !== trimmedName) {
        user.name = trimmedName;
      }
    } else {
      user = new User({
        name: trimmedName,
        email: trimmedEmail,
        role: 'candidate',
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return tokens in response body (not cookies) for cross-domain support
    res.json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error('candidateLogin error:', err);
    next(err);
  }
};

// @POST /api/auth/login (Admin)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password +refreshToken');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.role !== 'admin') {
      return res.status(400).json({ error: 'Candidates do not use a password. Use the candidate login.' });
    }

    if (!user.password || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error('login error:', err);
    next(err);
  }
};

// @POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    // Accept refresh token from body or header
    const token = req.body?.refreshToken || req.headers['x-refresh-token'];

    if (!token) return res.status(401).json({ error: 'No refresh token.' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error('refresh error:', err);
    next(err);
  }
};

// @POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// @POST /api/auth/setup-admin
const createAdmin = async (req, res, next) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ error: 'Admin already exists.' });
    }
    const { name, email, password } = req.body;
    const admin = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({ message: 'Admin created.', email: admin.email });
  } catch (err) {
    next(err);
  }
};

module.exports = { candidateLogin, login, logout, refresh, getMe, createAdmin };