import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { PlayCircle, CheckCircle, XCircle, Clock, Trophy, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  SUBMITTED: { label: 'Submitted', icon: CheckCircle, className: 'status-submitted' },
  TERMINATED: { label: 'Terminated', icon: XCircle, className: 'status-terminated' },
  TIMED_OUT: { label: 'Timed Out', icon: Clock, className: 'status-timed_out' },
  IN_PROGRESS: { label: 'In Progress', icon: PlayCircle, className: 'status-in_progress' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attempts/my').then(r => setAttempts(r.data.attempts)).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: attempts.length,
    submitted: attempts.filter(a => a.status === 'SUBMITTED').length,
    avgScore: attempts.filter(a => a.status === 'SUBMITTED').length
      ? Math.round(attempts.filter(a => a.status === 'SUBMITTED').reduce((acc, a) => acc + (a.score / a.totalQuestions) * 100, 0) / attempts.filter(a => a.status === 'SUBMITTED').length)
      : 0,
    terminated: attempts.filter(a => a.status === 'TERMINATED').length,
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's your quiz activity overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Attempts', value: stats.total, icon: PlayCircle, color: 'text-brand-400' },
            { label: 'Completed', value: stats.submitted, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Avg. Score', value: `${stats.avgScore}%`, icon: Trophy, color: 'text-amber-400' },
            { label: 'Violations', value: stats.terminated, icon: AlertTriangle, color: 'text-red-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <Icon className={`w-5 h-5 ${color} mb-3`} />
              <p className="text-2xl font-display font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          to="/join"
          className="btn-primary inline-flex items-center gap-2 mb-8"
        >
          <PlayCircle className="w-4 h-4" />
          Join a Quiz
        </Link>

        {/* Attempts history */}
        <div className="card">
          <div className="p-6 border-b border-surface-border">
            <h2 className="font-display text-lg font-semibold text-white">Attempt History</h2>
          </div>
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : attempts.length === 0 ? (
            <div className="p-12 text-center">
              <PlayCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No attempts yet. Join a quiz to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {attempts.map(attempt => {
                const cfg = statusConfig[attempt.status];
                const Icon = cfg.icon;
                return (
                  <div key={attempt._id} className="p-5 flex items-center justify-between gap-4 hover:bg-surface-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{attempt.session?.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {attempt.session?.sessionCode} · {formatDistanceToNow(new Date(attempt.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {attempt.status !== 'IN_PROGRESS' && (
                        <span className="text-sm font-mono text-white">
                          {attempt.score}/{attempt.totalQuestions}
                        </span>
                      )}
                      <span className={cfg.className}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      {['SUBMITTED', 'TERMINATED', 'TIMED_OUT'].includes(attempt.status) && (
                        <Link
                          to={`/result/${attempt._id}`}
                          className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                        >
                          View
                        </Link>
                      )}
                      {attempt.status === 'IN_PROGRESS' && (
                        <Link
                          to={`/quiz/${attempt._id}`}
                          className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                        >
                          Resume
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
