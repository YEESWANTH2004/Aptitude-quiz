// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider, useAuth } from './context/AuthContext';

// // Pages
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import DashboardPage from './pages/DashboardPage';
// import JoinQuizPage from './pages/JoinQuizPage';
// import QuizPage from './pages/QuizPage';
// import ResultPage from './pages/ResultPage';
// import TerminatedPage from './pages/TerminatedPage';

// // Admin Pages
// import AdminDashboard from './pages/admin/AdminDashboard';
// import QuestionsPage from './pages/admin/QuestionsPage';
// import SessionsPage from './pages/admin/SessionsPage';
// import SessionDetailPage from './pages/admin/SessionDetailPage';
// import ResultsPage from './pages/admin/ResultsPage';

// const ProtectedRoute = ({ children, adminOnly = false }) => {
//   const { user, loading } = useAuth();
//   if (loading) return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
//     </div>
//   );
//   if (!user) return <Navigate to="/login" replace />;
//   if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
//   return children;
// };

// const PublicRoute = ({ children }) => {
//   const { user, loading } = useAuth();
//   if (loading) return null;
//   if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
//   return children;
// };

// function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/" element={<Navigate to="/login" replace />} />
//       <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
//       <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

//       {/* Candidate Routes */}
//       <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
//       <Route path="/join" element={<ProtectedRoute><JoinQuizPage /></ProtectedRoute>} />
//       <Route path="/quiz/:attemptId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
//       <Route path="/result/:attemptId" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
//       <Route path="/terminated" element={<ProtectedRoute><TerminatedPage /></ProtectedRoute>} />

//       {/* Admin Routes */}
//       <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
//       <Route path="/admin/questions" element={<ProtectedRoute adminOnly><QuestionsPage /></ProtectedRoute>} />
//       <Route path="/admin/sessions" element={<ProtectedRoute adminOnly><SessionsPage /></ProtectedRoute>} />
//       <Route path="/admin/sessions/:id" element={<ProtectedRoute adminOnly><SessionDetailPage /></ProtectedRoute>} />
//       <Route path="/admin/results" element={<ProtectedRoute adminOnly><ResultsPage /></ProtectedRoute>} />

//       <Route path="*" element={<Navigate to="/login" replace />} />
//     </Routes>
//   );
// }

// export default function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <AppRoutes />
//         <Toaster
//           position="top-right"
//           toastOptions={{
//             style: {
//               background: '#16162a',
//               color: '#fff',
//               border: '1px solid #2a2a4a',
//               borderRadius: '12px',
//               fontFamily: 'DM Sans, sans-serif',
//             },
//             success: { iconTheme: { primary: '#4ade80', secondary: '#16162a' } },
//             error: { iconTheme: { primary: '#f87171', secondary: '#16162a' } },
//           }}
//         />
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }


import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import JoinQuizPage from './pages/JoinQuizPage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import TerminatedPage from './pages/TerminatedPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import QuestionsPage from './pages/admin/QuestionsPage';
import SessionsPage from './pages/admin/SessionsPage';
import SessionDetailPage from './pages/admin/SessionDetailPage';
import ResultsPage from './pages/admin/ResultsPage';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

      {/* Candidate Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/join" element={<ProtectedRoute><JoinQuizPage /></ProtectedRoute>} />
      <Route path="/quiz/:attemptId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
      <Route path="/result/:attemptId" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
      <Route path="/terminated" element={<ProtectedRoute><TerminatedPage /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/questions" element={<ProtectedRoute adminOnly><QuestionsPage /></ProtectedRoute>} />
      <Route path="/admin/sessions" element={<ProtectedRoute adminOnly><SessionsPage /></ProtectedRoute>} />
      <Route path="/admin/sessions/:id" element={<ProtectedRoute adminOnly><SessionDetailPage /></ProtectedRoute>} />
      <Route path="/admin/results" element={<ProtectedRoute adminOnly><ResultsPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#16162a',
              color: '#fff',
              border: '1px solid #2a2a4a',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#4ade80', secondary: '#16162a' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#16162a' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}