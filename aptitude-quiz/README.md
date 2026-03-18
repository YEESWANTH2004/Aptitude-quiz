# 🧠 AptitudeIQ — Full-Stack Quiz Platform

A production-ready MERN stack aptitude quiz application with anti-cheat enforcement, admin panel, real-time session monitoring, and full mobile/desktop support.

---

## 📁 Project Structure

```
aptitude-quiz/
├── backend/                  # Node.js + Express API
│   ├── config/db.js
│   ├── controllers/          # authController, questionController, sessionController, attemptController
│   ├── middleware/           # auth.js, errorHandler.js
│   ├── models/               # User, Question, QuizSession, Attempt
│   ├── routes/               # auth, questions, sessions, attempts
│   ├── utils/seed.js
│   ├── server.js
│   └── package.json
│
├── frontend/                 # React 18 + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/common/Layout.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── JoinQuizPage.jsx
│   │   │   ├── QuizPage.jsx          ← Anti-cheat here
│   │   │   ├── ResultPage.jsx
│   │   │   ├── TerminatedPage.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── QuestionsPage.jsx
│   │   │       ├── SessionsPage.jsx
│   │   │       ├── SessionDetailPage.jsx
│   │   │       └── ResultsPage.jsx
│   │   └── utils/api.js
│   └── package.json
│
├── REQUIREMENTS.md
├── render.yaml
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Git

### Step 1 — Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Fill in your MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET

# Frontend
cd ../frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api (already set)
```

### Step 2 — Set up MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Create a free M0 cluster
3. Create a database user (username + password)
4. Allow network access: `0.0.0.0/0`
5. Copy the connection string into `backend/.env` as `MONGO_URI`

### Step 3 — Seed Sample Data

```bash
cd backend
npm run seed
```

This creates:
- **Admin:** `admin@quiz.com` / `Admin@123`
- **Candidate:** `candidate@quiz.com` / `Test@123`
- **Session Code:** `DEMO01` (8 questions, 30 min)

### Step 4 — Run Locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open: http://localhost:5173

---

## 🛡️ Anti-Cheat System

The anti-cheat is enforced **both frontend and backend**:

### Frontend (QuizPage.jsx)
```javascript
// Tab visibility change
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') terminateAttempt('TAB_SWITCH');
});

// Window blur (alt-tab, click outside)
window.addEventListener('blur', () => {
  setTimeout(() => {
    if (document.visibilityState === 'hidden') terminateAttempt('WINDOW_BLUR');
  }, 300);
});

// Warn before closing
window.addEventListener('beforeunload', (e) => {
  e.preventDefault();
  e.returnValue = 'Leaving will terminate your quiz!';
});
```

### Backend (attemptController.js)
- Every `/answer` submission validates `status === 'IN_PROGRESS'`
- Every submission checks `expiresAt` server-side
- Termination sets `status = 'TERMINATED'` and logs `violations[]` with timestamp
- Admin receives real-time Socket.IO event on termination

---

## ☁️ Deployment

### Backend → Render

1. Push project to GitHub
2. Go to https://render.com → New Web Service
3. Connect your GitHub repo
4. Settings:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
5. Add Environment Variables:
   ```
   PORT=5000
   NODE_ENV=production
   MONGO_URI=<your Atlas URI>
   JWT_SECRET=<random 64-char string>
   JWT_REFRESH_SECRET=<random 64-char string>
   CLIENT_URL=<your Vercel frontend URL>
   ```
6. Deploy → Copy your Render URL (e.g. `https://aptitude-quiz-api.onrender.com`)

### Frontend → Vercel

1. Go to https://vercel.com → New Project
2. Import your GitHub repo
3. Settings:
   - Root directory: `frontend`
   - Framework: Vite
4. Add Environment Variable:
   ```
   VITE_API_URL=https://aptitude-quiz-api.onrender.com/api
   ```
5. Deploy → Copy your Vercel URL
6. **Go back to Render** and update `CLIENT_URL` to your Vercel URL

### Post-Deployment: Seed Admin

After deploying, call the setup endpoint once:
```bash
curl -X POST https://your-render-url.onrender.com/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@yourdomain.com","password":"SecurePass@123"}'
```

---

## 📱 Mobile Support

- Fully responsive (Tailwind CSS)
- PWA-ready (add manifest + service worker for installable app)
- Touch-friendly quiz interface
- Bottom sheet modals on mobile

---

## 🔒 Security Features

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt (12 rounds) |
| JWT auth | Access (15min) + Refresh (7d) |
| HTTP headers | Helmet.js |
| Rate limiting | express-rate-limit (auth routes) |
| CORS | Restricted to frontend URL |
| Anti-cheat | visibilitychange + blur + server validation |
| Answer security | Correct answers never sent to client |

---

## 🧪 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register candidate |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | User | Get profile |
| GET | `/api/questions` | User | List questions |
| POST | `/api/questions` | Admin | Create question |
| GET | `/api/sessions` | Admin | List sessions |
| POST | `/api/sessions` | Admin | Create session |
| GET | `/api/sessions/code/:code` | User | Find session by code |
| POST | `/api/attempts/start` | User | Start quiz |
| POST | `/api/attempts/:id/answer` | User | Save answer |
| POST | `/api/attempts/:id/submit` | User | Final submit |
| POST | `/api/attempts/:id/terminate` | User | Anti-cheat terminate |
| GET | `/api/attempts/:id/result` | User | Get result |
| GET | `/api/attempts` | Admin | All attempts |

---

## 🐛 Troubleshooting

**CORS errors:** Make sure `CLIENT_URL` in backend `.env` exactly matches your frontend URL (no trailing slash).

**MongoDB connection:** Ensure `0.0.0.0/0` is in Atlas IP Allowlist for Render's dynamic IPs.

**Anti-cheat false triggers on mobile:** The 300ms blur delay helps. Consider disabling `blur` event on mobile and relying only on `visibilitychange`.

**Render cold starts:** Free tier spins down after inactivity. Consider using Render's "cron job" to ping `/api/health` every 5 min.
