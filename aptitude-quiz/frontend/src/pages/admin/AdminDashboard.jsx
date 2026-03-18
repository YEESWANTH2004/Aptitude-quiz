import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import api from '../../utils/api';
import { FileQuestion, PlayCircle, BarChart3, Users, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/attempts'),
      api.get('/questions'),
      api.get('/sessions'),
    ]).then(([attRes, qRes, sRes]) => {
      const attempts = attRes.data.attempts;
      const questions = qRes.data.questions;
      const sessions = sRes.data.sessions;

      const submitted = attempts.filter(a => a.status === 'SUBMITTED');
      const avgScore = submitted.length
        ? Math.round(submitted.reduce((acc, a) => acc + (a.score / (a.totalQuestions || 1)) * 100, 0) / submitted.length)
        : 0;

      setStats({
        totalQuestions: questions.total || questions.length,
        totalSessions: sessions.length,
        totalAttempts: attempts.length,
        avgScore,
        terminated: attempts.filter(a => a.status === 'TERMINATED').length,
        inProgress: attempts.filter(a => a.status === 'IN_PROGRESS').length,
      });

      // Score distribution for chart
      const dist = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
      submitted.forEach(a => {
        const pct = (a.score / (a.totalQuestions || 1)) * 100;
        if (pct <= 20) dist['0-20']++;
        else if (pct <= 40) dist['21-40']++;
        else if (pct <= 60) dist['41-60']++;
        else if (pct <= 80) dist['61-80']++;
        else dist['81-100']++;
      });

      setRecentAttempts(attempts.slice(0, 8));
    }).finally(() => setLoading(false));
  }, []);

  const statusIcon = { SUBMITTED: CheckCircle, TERMINATED: XCircle, TIMED_OUT: Clock, IN_PROGRESS: PlayCircle };
  const statusColor = { SUBMITTED: 'text-emerald-400', TERMINATED: 'text-red-400', TIMED_OUT: 'text-amber-400', IN_PROGRESS: 'text-brand-400' };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of all quiz activity</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Questions', value: stats?.totalQuestions ?? '—', icon: FileQuestion, color: 'text-brand-400', href: '/admin/questions' },
            { label: 'Sessions', value: stats?.totalSessions ?? '—', icon: PlayCircle, color: 'text-purple-400', href: '/admin/sessions' },
            { label: 'Attempts', value: stats?.totalAttempts ?? '—', icon: Users, color: 'text-cyan-400', href: '/admin/results' },
            { label: 'Avg Score', value: stats ? `${stats.avgScore}%` : '—', icon: TrendingUp, color: 'text-emerald-400', href: '/admin/results' },
            { label: 'Live Now', value: stats?.inProgress ?? '—', icon: BarChart3, color: 'text-amber-400', href: '/admin/results' },
            { label: 'Violations', value: stats?.terminated ?? '—', icon: AlertTriangle, color: 'text-red-400', href: '/admin/results' },
          ].map(({ label, value, icon: Icon, color, href }) => (
            <Link key={label} to={href} className="card p-5 hover:border-brand-500/30 transition-colors">
              <Icon className={`w-5 h-5 ${color} mb-3`} />
              <p className="text-2xl font-display font-bold text-white">{loading ? '—' : value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Attempts */}
          <div className="lg:col-span-2 card">
            <div className="p-6 border-b border-surface-border flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">Recent Attempts</h2>
              <Link to="/admin/results" className="text-xs text-brand-400 hover:text-brand-300">View all</Link>
            </div>
            {loading ? (
              <div className="p-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentAttempts.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No attempts yet</div>
            ) : (
              <div className="divide-y divide-surface-border">
                {recentAttempts.map(attempt => {
                  const Icon = statusIcon[attempt.status] || CheckCircle;
                  const color = statusColor[attempt.status] || 'text-gray-400';
                  return (
                    <div key={attempt._id} className="px-6 py-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{attempt.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{attempt.session?.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {attempt.status !== 'IN_PROGRESS' && (
                          <span className="text-sm font-mono text-gray-400">{attempt.score}/{attempt.totalQuestions}</span>
                        )}
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/admin/questions" className="flex items-center gap-3 p-3 bg-surface-muted hover:bg-surface-border rounded-xl transition-colors">
                <div className="w-9 h-9 bg-brand-500/15 rounded-lg flex items-center justify-center">
                  <FileQuestion className="w-4 h-4 text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Add Question</p>
                  <p className="text-xs text-gray-500">Manage question bank</p>
                </div>
              </Link>
              <Link to="/admin/sessions" className="flex items-center gap-3 p-3 bg-surface-muted hover:bg-surface-border rounded-xl transition-colors">
                <div className="w-9 h-9 bg-purple-500/15 rounded-lg flex items-center justify-center">
                  <PlayCircle className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Create Session</p>
                  <p className="text-xs text-gray-500">Set up a new quiz</p>
                </div>
              </Link>
              <Link to="/admin/results" className="flex items-center gap-3 p-3 bg-surface-muted hover:bg-surface-border rounded-xl transition-colors">
                <div className="w-9 h-9 bg-emerald-500/15 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">View Reports</p>
                  <p className="text-xs text-gray-500">Full results &amp; analytics</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
