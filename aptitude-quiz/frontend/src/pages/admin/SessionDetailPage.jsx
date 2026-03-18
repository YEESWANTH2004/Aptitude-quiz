import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import api from '../../utils/api';
import { ArrowLeft, Copy, CheckCircle, XCircle, Clock, PlayCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  SUBMITTED: { label: 'Submitted', icon: CheckCircle, color: 'text-emerald-400' },
  TERMINATED: { label: 'Terminated', icon: XCircle, color: 'text-red-400' },
  TIMED_OUT: { label: 'Timed Out', icon: Clock, color: 'text-amber-400' },
  IN_PROGRESS: { label: 'Live', icon: PlayCircle, color: 'text-brand-400' },
};

export default function SessionDetailPage() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [sRes, aRes] = await Promise.all([
        api.get(`/sessions/${id}`),
        api.get(`/attempts?sessionId=${id}`),
      ]);
      setSession(sRes.data.session);
      setAttempts(aRes.data.attempts);
    } catch {
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Auto refresh every 15s
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );

  const submitted = attempts.filter(a => a.status === 'SUBMITTED');
  const inProgress = attempts.filter(a => a.status === 'IN_PROGRESS');
  const avgScore = submitted.length
    ? Math.round(submitted.reduce((acc, a) => acc + (a.score / (a.totalQuestions || 1)) * 100, 0) / submitted.length)
    : 0;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <Link to="/admin/sessions" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Sessions
        </Link>

        {/* Session header */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display text-xl font-bold text-white">{session?.name}</h1>
                <span className={`badge ${session?.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-500/15 text-gray-500'}`}>
                  {session?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {session?.description && <p className="text-gray-500 text-sm mb-3">{session.description}</p>}
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <span>{session?.questions?.length} questions</span>
                <span>{session?.timeLimit} min</span>
                <span>Max {session?.maxAttempts} attempt(s)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-brand-300 bg-brand-500/15 border border-brand-500/30 px-4 py-2 rounded-xl text-lg font-bold">
                {session?.sessionCode}
              </span>
              <button
                onClick={() => { navigator.clipboard.writeText(session?.sessionCode); toast.success('Copied!'); }}
                className="p-2 text-gray-500 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Attempts', value: attempts.length },
            { label: 'Live Now', value: inProgress.length, highlight: inProgress.length > 0 },
            { label: 'Completed', value: submitted.length },
            { label: 'Avg Score', value: `${avgScore}%` },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`card p-5 ${highlight ? 'border-brand-500/30 bg-brand-500/5' : ''}`}>
              <p className={`text-2xl font-display font-bold ${highlight ? 'text-brand-300' : 'text-white'}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Refresh button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-white">Candidate Attempts</h2>
          <button onClick={fetchData} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Attempts table */}
        <div className="card overflow-hidden">
          {attempts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No attempts yet for this session</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Violations</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {attempts.map(a => {
                    const cfg = statusConfig[a.status];
                    const Icon = cfg.icon;
                    const pct = a.totalQuestions ? Math.round((a.score / a.totalQuestions) * 100) : 0;
                    return (
                      <tr key={a._id} className="hover:bg-surface-muted/50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-medium text-white">{a.user?.name}</p>
                          <p className="text-xs text-gray-500">{a.user?.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          {a.status !== 'IN_PROGRESS' ? (
                            <div>
                              <span className="font-mono font-bold text-white">{a.score}/{a.totalQuestions}</span>
                              <div className="w-16 h-1.5 bg-surface-border rounded-full mt-1">
                                <div
                                  className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          ) : <span className="text-gray-500">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`flex items-center gap-1.5 text-xs font-semibold ${cfg.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {a.violations?.length > 0
                            ? <span className="text-red-400 text-xs font-semibold">{a.violations.length} violation(s)</span>
                            : <span className="text-gray-600 text-xs">None</span>
                          }
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs">
                          {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                        </td>
                        <td className="px-5 py-4">
                          {a.status !== 'IN_PROGRESS' && (
                            <Link to={`/result/${a._id}`} className="text-xs text-brand-400 hover:text-brand-300">
                              View
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
