import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import api from '../../utils/api';
import { Download, Filter, CheckCircle, XCircle, Clock, PlayCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  SUBMITTED: { label: 'Submitted', icon: CheckCircle, cls: 'status-submitted' },
  TERMINATED: { label: 'Terminated', icon: XCircle, cls: 'status-terminated' },
  TIMED_OUT: { label: 'Timed Out', icon: Clock, cls: 'status-timed_out' },
  IN_PROGRESS: { label: 'In Progress', icon: PlayCircle, cls: 'status-in_progress' },
};

export default function ResultsPage() {
  const [attempts, setAttempts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSession, setFilterSession] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/sessions'),
    ]).then(([sRes]) => {
      setSessions(sRes.data.sessions);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterSession) params.set('sessionId', filterSession);
    if (filterStatus) params.set('status', filterStatus);
    api.get(`/attempts?${params}`)
      .then(r => setAttempts(r.data.attempts))
      .finally(() => setLoading(false));
  }, [filterSession, filterStatus]);

  const exportCSV = () => {
    const rows = [
      ['Candidate', 'Email', 'Session', 'Score', 'Total', 'Percent', 'Status', 'Violations', 'Date'],
      ...attempts.map(a => [
        a.user?.name,
        a.user?.email,
        a.session?.name,
        a.score,
        a.totalQuestions,
        a.totalQuestions ? `${Math.round((a.score / a.totalQuestions) * 100)}%` : '—',
        a.status,
        a.violations?.length || 0,
        new Date(a.createdAt).toLocaleString(),
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const submitted = attempts.filter(a => a.status === 'SUBMITTED');
  const avgScore = submitted.length
    ? Math.round(submitted.reduce((acc, a) => acc + (a.score / (a.totalQuestions || 1)) * 100, 0) / submitted.length)
    : 0;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Results & Reports</h1>
            <p className="text-gray-500 text-sm mt-1">
              {attempts.length} total · {submitted.length} submitted · avg {avgScore}%
            </p>
          </div>
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 self-start sm:self-auto">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select className="input w-auto" value={filterSession} onChange={e => setFilterSession(e.target.value)}>
            <option value="">All Sessions</option>
            {sessions.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select className="input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="TERMINATED">Terminated</option>
            <option value="TIMED_OUT">Timed Out</option>
            <option value="IN_PROGRESS">In Progress</option>
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : attempts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No results found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {['Candidate', 'Session', 'Score', 'Status', 'Violations', 'Date', ''].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {attempts.map(a => {
                    const cfg = statusConfig[a.status] || statusConfig.SUBMITTED;
                    const Icon = cfg.icon;
                    const pct = a.totalQuestions ? Math.round((a.score / a.totalQuestions) * 100) : 0;
                    return (
                      <tr key={a._id} className="hover:bg-surface-muted/50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-medium text-white">{a.user?.name}</p>
                          <p className="text-xs text-gray-500">{a.user?.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-gray-300 truncate max-w-[180px]">{a.session?.name}</p>
                          <p className="text-xs text-gray-600 font-mono">{a.session?.sessionCode}</p>
                        </td>
                        <td className="px-5 py-4">
                          {a.status !== 'IN_PROGRESS' ? (
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-white">{a.score}/{a.totalQuestions}</span>
                              <div className="w-16 h-1.5 bg-surface-border rounded-full">
                                <div
                                  className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">{pct}%</span>
                            </div>
                          ) : <span className="text-gray-500">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          <span className={cfg.cls}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {a.violations?.length > 0
                            ? <span className="text-red-400 text-xs font-semibold">{a.violations.length}</span>
                            : <span className="text-gray-600 text-xs">0</span>
                          }
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                          {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                        </td>
                        <td className="px-5 py-4">
                          {a.status !== 'IN_PROGRESS' && (
                            <Link to={`/result/${a._id}`} className="text-xs text-brand-400 hover:text-brand-300 whitespace-nowrap">
                              View Details
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
