# 📋 AptitudeQuiz — Full Requirements Document

## 1. Project Overview
A full-stack MERN (MongoDB, Express, React, Node.js) aptitude quiz platform with anti-cheat enforcement, admin panel, real-time session management, and mobile/desktop responsiveness.

---

## 2. Tech Stack

| Layer       | Technology                            |
|-------------|---------------------------------------|
| Frontend    | React 18, Vite, TailwindCSS, Axios    |
| Backend     | Node.js, Express.js                   |
| Database    | MongoDB Atlas (via Mongoose)          |
| Auth        | JWT (access + refresh tokens)         |
| Real-time   | Socket.IO (session events)            |
| Deployment  | Render (backend) + Vercel (frontend)  |
| Mobile      | Responsive PWA (installable)          |

---

## 3. User Roles

### 3.1 Admin
- Login with secure credentials
- Create / edit / delete questions (MCQ, True/False, Open-ended, Fill-in-the-blank)
- Create quiz sessions (assign questions, set time limits, set attempt limits)
- View all results, filter by user/session
- Monitor live active sessions

### 3.2 Candidate (Quiz Taker)
- Register / Login
- Join a quiz via session code
- Take quiz with timer
- Session auto-closes on tab switch / window blur
- View results after submission

---

## 4. Core Features

### 4.1 Authentication
- JWT-based login/register
- Roles: `admin`, `candidate`
- Protected routes per role
- Refresh token rotation

### 4.2 Question Bank
- Question types:
  - **MCQ**: question + 2–6 options + correct answer
  - **True/False**: question + boolean answer
  - **Open-ended**: question only, manual/AI grading
  - **Fill-in-the-blank**: question with `___` placeholder + correct answer
- Tags (category: Quantitative, Verbal, Logical, etc.)
- Difficulty: Easy / Medium / Hard

### 4.3 Quiz Sessions
- Admin creates a session with:
  - Name, description
  - Selected questions (random or manual)
  - Time limit per quiz (minutes)
  - Max attempts allowed
  - Start/End datetime window
  - Passcode (optional)
- Generates unique 6-char session code

### 4.4 Anti-Cheat — Tab Switch Detection
- On quiz start, Fullscreen is requested (optional, graceful fallback)
- `visibilitychange` event listener: if tab becomes hidden → **session terminated immediately**
- `blur` event on window: if user alt-tabs → **session terminated**
- `beforeunload` event: warns user before closing
- Each violation is logged with timestamp
- On termination: quiz auto-submits with answers so far, session marked `TERMINATED`
- Backend validates session state on every answer submission

### 4.5 Timer
- Countdown timer per quiz session
- Timer state stored in backend (not just frontend) to prevent manipulation
- Auto-submit when time expires

### 4.6 Results & Reports
- Score calculation (auto for MCQ/TF/FIB)
- Per-question breakdown
- Time taken
- Violation log
- Admin can export results as CSV

---

## 5. Database Models

### User
```
_id, name, email, password (hashed), role, createdAt
```

### Question
```
_id, type, text, options[], correctAnswer, explanation, tags[], difficulty, createdBy, createdAt
```

### QuizSession
```
_id, name, description, questions[], timeLimit, maxAttempts, startDate, endDate, passcode, sessionCode, createdBy, isActive
```

### Attempt
```
_id, user, session, answers[], score, totalQuestions, startedAt, submittedAt, status (IN_PROGRESS | SUBMITTED | TERMINATED | TIMED_OUT), violations[]
```

---

## 6. API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET  /api/auth/me

### Questions
- GET    /api/questions
- POST   /api/questions
- PUT    /api/questions/:id
- DELETE /api/questions/:id

### Sessions
- GET    /api/sessions
- POST   /api/sessions
- GET    /api/sessions/:code (by session code)
- PUT    /api/sessions/:id
- DELETE /api/sessions/:id

### Attempts
- POST /api/attempts/start        (start quiz)
- POST /api/attempts/:id/answer   (submit individual answer)
- POST /api/attempts/:id/submit   (final submission)
- POST /api/attempts/:id/terminate (tab switch violation)
- GET  /api/attempts/:id/result
- GET  /api/attempts              (admin: all attempts)

---

## 7. Anti-Cheat Flow (Detailed)

```
User starts quiz
  → Backend creates Attempt (status: IN_PROGRESS)
  → Frontend registers:
      - document.addEventListener('visibilitychange', handleViolation)
      - window.addEventListener('blur', handleViolation)
      - window.addEventListener('beforeunload', handleWarn)
  → On violation:
      - POST /api/attempts/:id/terminate { reason: 'TAB_SWITCH' }
      - Backend sets status: TERMINATED, logs violation
      - Frontend redirects to "Session Terminated" page
      - Cannot re-enter same attempt
```

---

## 8. Frontend Pages

| Page | Route | Role |
|------|-------|------|
| Login | /login | All |
| Register | /register | Candidate |
| Dashboard | /dashboard | Candidate |
| Join Quiz | /join | Candidate |
| Quiz Interface | /quiz/:attemptId | Candidate |
| Result | /result/:attemptId | Candidate |
| Admin Dashboard | /admin | Admin |
| Question Manager | /admin/questions | Admin |
| Session Manager | /admin/sessions | Admin |
| Session Detail | /admin/sessions/:id | Admin |
| Results Viewer | /admin/results | Admin |

---

## 9. Deployment

### Backend (Render)
- Node.js web service
- Environment variables: MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, CLIENT_URL, PORT
- Free tier or paid Render service

### Frontend (Vercel)
- Vite React app
- Environment variables: VITE_API_URL
- Auto-deploy from GitHub

### Database
- MongoDB Atlas free cluster (M0)
- IP whitelist: 0.0.0.0/0 for Render

---

## 10. Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/quizdb
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLIENT_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 11. Security Checklist
- [x] Passwords hashed with bcrypt (salt rounds: 12)
- [x] JWT expiry: 15min access, 7d refresh
- [x] Helmet.js for HTTP headers
- [x] CORS restricted to frontend URL
- [x] Rate limiting on auth routes (express-rate-limit)
- [x] Input validation (express-validator)
- [x] MongoDB injection prevention (mongoose sanitization)
- [x] Anti-cheat validated server-side (not just frontend)
