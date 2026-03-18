import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, X, Copy, ExternalLink, ToggleLeft, ToggleRight, Trash2, Clock, Hash } from 'lucide-react';

const emptyForm = {
  name: '',
  description: '',
  questions: [],
  timeLimit: 30,
  maxAttempts: 1,
  startDate: '',
  endDate: '',
  passcode: '',
  isActive: true,
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [qSearch, setQSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, qRes] = await Promise.all([
        api.get('/sessions'),
        api.get('/questions?limit=200'),
      ]);
      setSessions(sRes.data.sessions);
      setQuestions(qRes.data.questions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Session name required');
    if (form.questions.length === 0) return toast.error('Select at least one question');
    setSaving(true);
    try {
      await api.post('/sessions', {
        ...form,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        passcode: form.passcode || undefined,
      });
      toast.success('Session created!');
      setShowModal(false);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (session) => {
    try {
      await api.put(`/sessions/${session._id}`, { isActive: !session.isActive });
      setSessions(prev => prev.map(s => s._id === session._id ? { ...s, isActive: !s.isActive } : s));
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this session? All attempts will remain.')) return;
    try {
      await api.delete(`/sessions/${id}`);
      toast.success('Session deleted');
      fetchData();
    } catch { toast.error('Delete failed'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Session code copied!');
  };

  const toggleQuestion = (qId) => {
    setForm(f => ({
      ...f,
      questions: f.questions.includes(qId)
        ? f.questions.filter(id => id !== qId)
        : [...f.questions, qId],
    }));
  };

  const filteredQ = questions.filter(q =>
    q.text.toLowerCase().includes(qSearch.toLowerCase()) ||
    q.tags.some(t => t.toLowerCase().includes(qSearch.toLowerCase()))
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Quiz Sessions</h1>
            <p className="text-gray-500 text-sm mt-1">{sessions.length} sessions</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Create Session
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">No sessions yet. Create one!</div>
        ) : (
          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s._id} className="card p-5 hover:border-brand-500/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white truncate">{s.name}</h3>
                      <span className={`badge ${s.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-500/15 text-gray-500'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {s.description && <p className="text-sm text-gray-500 truncate mb-2">{s.description}</p>}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{s.questions?.length} questions</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.timeLimit} min</span>
                      <span>Max {s.maxAttempts} attempt{s.maxAttempts > 1 ? 's' : ''}</span>
                      {s.passcode && <span className="text-amber-500">🔒 Passcode protected</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Session code */}
                    <button
                      onClick={() => copyCode(s.sessionCode)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/15 border border-brand-500/30 rounded-lg text-brand-300 text-sm font-mono hover:bg-brand-500/25 transition-colors"
                    >
                      {s.sessionCode}
                      <Copy className="w-3 h-3" />
                    </button>
                    <Link to={`/admin/sessions/${s._id}`} className="p-2 text-gray-500 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button onClick={() => toggleActive(s)} className="p-2 text-gray-500 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors">
                      {s.isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(s._id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full sm:max-w-3xl card max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-slide-up rounded-t-2xl sm:rounded-2xl">
            <div className="p-6 border-b border-surface-border flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-white">Create Quiz Session</h2>
              <button onClick={() => { setShowModal(false); setForm(emptyForm); }} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Session Name *</label>
                  <input className="input" placeholder="e.g. Campus Recruitment Round 1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Passcode <span className="text-gray-600">(optional)</span></label>
                  <input className="input" placeholder="Leave blank for open access" value={form.passcode} onChange={e => setForm(f => ({ ...f, passcode: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="label">Description <span className="text-gray-600">(optional)</span></label>
                <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="label">Time Limit (min)</label>
                  <input type="number" className="input" min={1} max={300} value={form.timeLimit} onChange={e => setForm(f => ({ ...f, timeLimit: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="label">Max Attempts</label>
                  <input type="number" className="input" min={1} max={10} value={form.maxAttempts} onChange={e => setForm(f => ({ ...f, maxAttempts: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <input type="datetime-local" className="input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input type="datetime-local" className="input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>

              {/* Question picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Select Questions *</label>
                  <span className="text-xs text-brand-400">{form.questions.length} selected</span>
                </div>
                <input
                  className="input mb-3"
                  placeholder="Search questions..."
                  value={qSearch}
                  onChange={e => setQSearch(e.target.value)}
                />
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {filteredQ.map(q => {
                    const selected = form.questions.includes(q._id);
                    return (
                      <button
                        key={q._id}
                        onClick={() => toggleQuestion(q._id)}
                        className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-start gap-3
                          ${selected ? 'border-brand-400/50 bg-brand-500/10' : 'border-surface-border bg-surface-muted hover:border-gray-500'}`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${selected ? 'bg-brand-500' : 'bg-surface-border'}`}>
                          {selected && <span className="text-white text-xs">✓</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-300 line-clamp-1">{q.text}</p>
                          <div className="flex gap-2 mt-1">
                            <span className={`badge-${q.type === 'true_false' ? 'tf' : q.type === 'fill_blank' ? 'fib' : q.type === 'open_ended' ? 'oe' : 'mcq'} text-xs`}>
                              {q.type}
                            </span>
                            <span className={`badge-${q.difficulty} text-xs`}>{q.difficulty}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-surface-border flex gap-3">
              <button onClick={() => { setShowModal(false); setForm(emptyForm); }} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {saving ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
