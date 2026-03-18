// // const express = require('express');
// // const http = require('http');
// // const { Server } = require('socket.io');
// // const cors = require('cors');
// // const helmet = require('helmet');
// // const morgan = require('morgan');
// // const cookieParser = require('cookie-parser');
// // const rateLimit = require('express-rate-limit');
// // require('dotenv').config();

// // const connectDB = require('./config/db');
// // const authRoutes = require('./routes/auth');
// // const questionRoutes = require('./routes/questions');
// // const sessionRoutes = require('./routes/sessions');
// // const attemptRoutes = require('./routes/attempts');
// // const { errorHandler } = require('./middleware/errorHandler');

// // const app = express();
// // const server = http.createServer(app);

// // // Socket.IO setup
// // const io = new Server(server, {
// //   cors: {
// //     origin: process.env.CLIENT_URL || 'http://localhost:5173',
// //     credentials: true,
// //   },
// // });

// // // Make io accessible in routes
// // app.set('io', io);

// // // Connect DB
// // connectDB();

// // // Security Middleware
// // app.use(helmet());
// // app.use(cors({
// //   origin: process.env.CLIENT_URL || 'http://localhost:5173',
// //   credentials: true,
// // }));

// // // Rate limiting
// // const authLimiter = rateLimit({
// //   windowMs: 15 * 60 * 1000, // 15 minutes
// //   max: 20,
// //   message: { error: 'Too many requests, please try again later.' },
// // });

// // // Body parsing
// // app.use(express.json({ limit: '10mb' }));
// // app.use(express.urlencoded({ extended: true }));
// // app.use(cookieParser());
// // app.use(morgan('dev'));

// // // Routes
// // app.use('/api/auth', authLimiter, authRoutes);
// // app.use('/api/questions', questionRoutes);
// // app.use('/api/sessions', sessionRoutes);
// // app.use('/api/attempts', attemptRoutes);

// // // Health check
// // app.get('/api/health', (req, res) => {
// //   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// // });

// // // Socket.IO events
// // io.on('connection', (socket) => {
// //   console.log('Client connected:', socket.id);

// //   socket.on('join-admin', (adminId) => {
// //     socket.join(`admin-${adminId}`);
// //   });

// //   socket.on('join-attempt', (attemptId) => {
// //     socket.join(`attempt-${attemptId}`);
// //   });

// //   socket.on('disconnect', () => {
// //     console.log('Client disconnected:', socket.id);
// //   });
// // });

// // // Error handler
// // app.use(errorHandler);

// // const PORT = process.env.PORT || 5000;
// // server.listen(PORT, () => {
// //   console.log(`🚀 Server running on port ${PORT}`);
// // });

// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const cookieParser = require('cookie-parser');
// const rateLimit = require('express-rate-limit');
// require('dotenv').config();

// const connectDB = require('./config/db');
// const authRoutes = require('./routes/auth');
// const questionRoutes = require('./routes/questions');
// const sessionRoutes = require('./routes/sessions');
// const attemptRoutes = require('./routes/attempts');
// const { errorHandler } = require('./middleware/errorHandler');

// const app = express();
// const server = http.createServer(app);

// // ── CORS ──────────────────────────────────────────────────────────────────────
// const allowedOrigins = [
//   'http://localhost:5173',
//   'http://localhost:3000',
//   process.env.CLIENT_URL,
// ].filter(Boolean);

// const corsOptions = {
//   origin: function (origin, callback) {
//     // Allow requests with no origin (mobile apps, curl, Postman)
//     if (!origin) return callback(null, true);

//     // Allow any vercel.app subdomain
//     if (origin.endsWith('.vercel.app')) return callback(null, true);

//     // Allow any netlify.app subdomain
//     if (origin.endsWith('.netlify.app')) return callback(null, true);

//     // Allow explicitly listed origins
//     if (allowedOrigins.includes(origin)) return callback(null, true);

//     callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
// };

// app.use(cors(corsOptions));

// // Handle preflight requests for ALL routes
// app.options('*', cors(corsOptions));

// // Socket.IO setup
// const io = new Server(server, {
//   cors: {
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true);
//       if (origin.endsWith('.vercel.app')) return callback(null, true);
//       if (origin.endsWith('.netlify.app')) return callback(null, true);
//       if (allowedOrigins.includes(origin)) return callback(null, true);
//       callback(new Error('Not allowed by CORS'));
//     },
//     credentials: true,
//   },
// });

// // Make io accessible in routes
// app.set('io', io);

// // Connect DB
// connectDB();

// // Security Middleware
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: 'cross-origin' },
// }));

// // Rate limiting
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 50,
//   message: { error: 'Too many requests, please try again later.' },
// });

// // Body parsing
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(morgan('dev'));

// // Routes
// app.use('/api/auth', authLimiter, authRoutes);
// app.use('/api/questions', questionRoutes);
// app.use('/api/sessions', sessionRoutes);
// app.use('/api/attempts', attemptRoutes);

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// // Socket.IO events
// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);

//   socket.on('join-admin', (adminId) => {
//     socket.join(`admin-${adminId}`);
//   });

//   socket.on('join-attempt', (attemptId) => {
//     socket.join(`attempt-${attemptId}`);
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// // Error handler
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const sessionRoutes = require('./routes/sessions');
const attemptRoutes = require('./routes/attempts');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// ── CORS — allow all origins ──────────────────────────────────────────────────
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Cookie,X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

app.set('io', io);

// Connect DB
connectDB();

// Security Middleware (after CORS)
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many requests, please try again later.' },
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attempts', attemptRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join-admin', (adminId) => socket.join(`admin-${adminId}`));
  socket.on('join-attempt', (attemptId) => socket.join(`attempt-${attemptId}`));
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});