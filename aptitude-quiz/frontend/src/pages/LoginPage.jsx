// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { Brain, Eye, EyeOff, LogIn } from 'lucide-react';
// import toast from 'react-hot-toast';

// export default function LoginPage() {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [showPass, setShowPass] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const user = await login(form.email, form.password);
//       toast.success(`Welcome back, ${user.name}!`);
//       navigate(user.role === 'admin' ? '/admin' : '/dashboard');
//     } catch (err) {
//       toast.error(err.response?.data?.error || 'Login failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4">
//       <div className="w-full max-w-md animate-slide-up">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500/20 border border-brand-500/30 rounded-2xl mb-4">
//             <Brain className="w-8 h-8 text-brand-400" />
//           </div>
//           <h1 className="font-display text-3xl font-bold text-white">AptitudeIQ</h1>
//           <p className="text-gray-500 mt-1">Sign in to your account</p>
//         </div>

//         <div className="card p-8">
//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="label">Email address</label>
//               <input
//                 type="email"
//                 className="input"
//                 placeholder="you@example.com"
//                 value={form.email}
//                 onChange={e => setForm({ ...form, email: e.target.value })}
//                 required
//                 autoFocus
//               />
//             </div>

//             <div>
//               <label className="label">Password</label>
//               <div className="relative">
//                 <input
//                   type={showPass ? 'text' : 'password'}
//                   className="input pr-11"
//                   placeholder="••••••••"
//                   value={form.password}
//                   onChange={e => setForm({ ...form, password: e.target.value })}
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPass(!showPass)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
//                 >
//                   {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                 </button>
//               </div>
//             </div>

//             <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
//               {loading ? (
//                 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//               ) : (
//                 <LogIn className="w-4 h-4" />
//               )}
//               {loading ? 'Signing in...' : 'Sign In'}
//             </button>
//           </form>

//           <div className="mt-6 pt-6 border-t border-surface-border text-center">
//             <p className="text-gray-500 text-sm">
//               Don't have an account?{' '}
//               <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
//                 Create one
//               </Link>
//             </p>
//           </div>
//         </div>

//         {/* Demo credentials */}
//         <div className="mt-4 card p-4">
//           <p className="text-xs text-gray-500 font-medium mb-2">Demo credentials</p>
//           <div className="space-y-1 text-xs font-mono text-gray-400">
//             <p>Admin: admin@quiz.com / Admin@123</p>
//             <p>Candidate: candidate@quiz.com / Test@123</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { candidateLogin, adminLogin } = useAuth();
  const navigate = useNavigate();

  // 'candidate' or 'admin'
  const [mode, setMode] = useState('candidate');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'candidate') {
        if (!form.name.trim()) return toast.error('Please enter your name');
        const user = await candidateLogin(form.name, form.email);
        toast.success(`Welcome, ${user.name}!`);
        navigate('/dashboard');
      } else {
        const user = await adminLogin(form.email, form.password);
        toast.success(`Welcome back, ${user.name}!`);
        navigate('/admin');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500/20 border border-brand-500/30 rounded-2xl mb-4">
            <Brain className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">AptitudeIQ</h1>
          <p className="text-gray-500 mt-1">Online Aptitude Testing Platform</p>
        </div>

        {/* Mode toggle */}
        <div className="flex p-1 bg-surface-muted border border-surface-border rounded-xl mb-6">
          <button
            onClick={() => setMode('candidate')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all
              ${mode === 'candidate' ? 'bg-brand-500 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            I'm a Candidate
          </button>
          <button
            onClick={() => setMode('admin')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all
              ${mode === 'admin' ? 'bg-brand-500 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Admin Login
          </button>
        </div>

        <div className="card p-8">

          {/* Candidate mode */}
          {mode === 'candidate' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center mb-6">
                <p className="text-white font-semibold">Enter your details to begin</p>
                <p className="text-gray-500 text-sm mt-1">No password needed — just your name and email</p>
              </div>

              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="e.g. John Doe"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    className="input pl-10"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <ArrowRight className="w-4 h-4" />
                }
                {loading ? 'Entering...' : 'Enter & Take Quiz'}
              </button>

              <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 text-center">
                <p className="text-xs text-brand-300">
                  After entering, you'll be asked for a <strong>Session Code</strong> provided by your instructor to start the quiz.
                </p>
              </div>
            </form>
          )}

          {/* Admin mode */}
          {mode === 'admin' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center mb-6">
                <p className="text-white font-semibold">Admin Access</p>
                <p className="text-gray-500 text-sm mt-1">Sign in with your admin credentials</p>
              </div>

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    className="input pl-10"
                    placeholder="admin@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input pl-10 pr-11"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <ArrowRight className="w-4 h-4" />
                }
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="text-center">
                {/* <p className="text-xs text-gray-600">
                  Admin: admin@quiz.com / Admin@123
                </p> */}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}