import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search, X, Check } from 'lucide-react';

const TYPES = [
  { value: 'mcq', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True / False' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'open_ended', label: 'Open Ended' },
];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

const emptyForm = {
  type: 'mcq',
  text: '',
  options: [
    { label: 'A', text: '' },
    { label: 'B', text: '' },
    { label: 'C', text: '' },
    { label: 'D', text: '' },
  ],
  correctAnswer: '',
  explanation: '',
  tags: '',
  difficulty: 'medium',
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  const [page, setPage] = useState(1);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (filterType) params.set('type', filterType);
      if (filterDiff) params.set('difficulty', filterDiff);
      const { data } = await api.get(`/questions?${params}`);
      setQuestions(data.questions);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, [page, filterType, filterDiff]);
  useEffect(() => {
    const t = setTimeout(fetchQuestions, 400);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (q) => {
    setForm({
      type: q.type,
      text: q.text,
      options: q.options?.length ? q.options : emptyForm.options,
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || '',
      tags: q.tags?.join(', ') || '',
      difficulty: q.difficulty,
    });
    setEditingId(q._id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.text.trim()) return toast.error('Question text is required');
    if (form.type === 'mcq' && !form.correctAnswer) return toast.error('Select a correct answer');
    if (form.type === 'true_false' && !form.correctAnswer) return toast.error('Select True or False');
    if (form.type === 'fill_blank' && !form.correctAnswer.trim()) return toast.error('Correct answer is required');

    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        options: ['mcq'].includes(form.type) ? form.options.filter(o => o.text.trim()) : [],
      };

      if (editingId) {
        await api.put(`/questions/${editingId}`, payload);
        toast.success('Question updated');
      } else {
        await api.post('/questions', payload);
        toast.success('Question created');
      }
      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      toast.success('Deleted');
      fetchQuestions();
    } catch {
      toast.error('Delete failed');
    }
  };

  const typeBadge = { mcq: 'badge-mcq', true_false: 'badge-tf', fill_blank: 'badge-fib', open_ended: 'badge-oe' };
  const typeLabel = { mcq: 'MCQ', true_false: 'T/F', fill_blank: 'FIB', open_ended: 'Open' };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Question Bank</h1>
            <p className="text-gray-500 text-sm mt-1">{total} questions total</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              className="input pl-9"
              placeholder="Search questions..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="input w-auto" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select className="input w-auto" value={filterDiff} onChange={e => { setFilterDiff(e.target.value); setPage(1); }}>
            <option value="">All Difficulties</option>
            {DIFFICULTIES.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : questions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No questions found</div>
          ) : (
            <div className="divide-y divide-surface-border">
              {questions.map(q => (
                <div key={q._id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-surface-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={typeBadge[q.type]}>{typeLabel[q.type]}</span>
                      <span className={`badge-${q.difficulty}`}>{q.difficulty}</span>
                      {q.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="badge bg-surface-border text-gray-400">{tag}</span>
                      ))}
                    </div>
                    <p className="text-white text-sm line-clamp-2">{q.text}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => openEdit(q)} className="p-2 text-gray-500 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(q._id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Pagination */}
          {total > 15 && (
            <div className="p-4 border-t border-surface-border flex items-center justify-between">
              <p className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 15)}</p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-30">Prev</button>
                <button disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-30">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl card max-h-[90vh] flex flex-col animate-slide-up">
            <div className="p-6 border-b border-surface-border flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-white">
                {editingId ? 'Edit Question' : 'New Question'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Type */}
              <div>
                <label className="label">Question Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setForm(f => ({ ...f, type: t.value, correctAnswer: '' }))}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all
                        ${form.type === t.value ? 'border-brand-400 bg-brand-500/15 text-brand-300' : 'border-surface-border text-gray-400 hover:text-white'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text */}
              <div>
                <label className="label">Question Text</label>
                <textarea
                  className="input resize-none min-h-[90px]"
                  placeholder="Enter your question..."
                  value={form.text}
                  onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                />
              </div>

              {/* MCQ Options */}
              {form.type === 'mcq' && (
                <div>
                  <label className="label">Options & Correct Answer</label>
                  <div className="space-y-2">
                    {form.options.map((opt, i) => (
                      <div key={opt.label} className="flex items-center gap-3">
                        <button
                          onClick={() => setForm(f => ({ ...f, correctAnswer: opt.label }))}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all
                            ${form.correctAnswer === opt.label ? 'bg-emerald-500 text-white' : 'bg-surface-border text-gray-400 hover:bg-surface-muted'}`}
                        >
                          {opt.label}
                        </button>
                        <input
                          type="text"
                          className="input"
                          placeholder={`Option ${opt.label}`}
                          value={opt.text}
                          onChange={e => setForm(f => ({
                            ...f,
                            options: f.options.map((o, j) => j === i ? { ...o, text: e.target.value } : o)
                          }))}
                        />
                        {form.correctAnswer === opt.label && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Click a letter to mark it as correct</p>
                </div>
              )}

              {/* True/False */}
              {form.type === 'true_false' && (
                <div>
                  <label className="label">Correct Answer</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['true', 'false'].map(v => (
                      <button
                        key={v}
                        onClick={() => setForm(f => ({ ...f, correctAnswer: v }))}
                        className={`py-3 rounded-xl border font-semibold capitalize transition-all
                          ${form.correctAnswer === v
                            ? v === 'true' ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300' : 'border-red-400 bg-red-500/15 text-red-300'
                            : 'border-surface-border text-gray-400 hover:text-white'}`}
                      >
                        {v === 'true' ? '✓ True' : '✗ False'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Fill blank / Open ended answer */}
              {(form.type === 'fill_blank' || form.type === 'open_ended') && form.type !== 'open_ended' && (
                <div>
                  <label className="label">Correct Answer</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Expected correct answer"
                    value={form.correctAnswer}
                    onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))}
                  />
                </div>
              )}

              {form.type === 'fill_blank' && (
                <div>
                  <label className="label">Correct Answer</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Expected correct answer"
                    value={form.correctAnswer}
                    onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))}
                  />
                </div>
              )}

              {/* Explanation */}
              <div>
                <label className="label">Explanation <span className="text-gray-600">(optional)</span></label>
                <textarea
                  className="input resize-none"
                  rows={2}
                  placeholder="Explain the correct answer..."
                  value={form.explanation}
                  onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Difficulty</label>
                  <select className="input" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                    {DIFFICULTIES.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Tags <span className="text-gray-600">(comma-separated)</span></label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Quantitative, Logical..."
                    value={form.tags}
                    onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-surface-border flex gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
