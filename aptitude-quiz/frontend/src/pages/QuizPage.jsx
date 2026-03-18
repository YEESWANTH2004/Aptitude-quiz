import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle, CheckCircle } from 'lucide-react';

// ─── Timer ───────────────────────────────────────────────────────────────────
function useTimer(expiresAt, onExpire) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
      setSeconds(remaining);
      if (remaining === 0) onExpire();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return { display: `${m}:${s}`, seconds, isWarning: seconds < 120 };
}

// ─── Question renderer ────────────────────────────────────────────────────────
function QuestionCard({ question, answer, onAnswer }) {
  if (!question) return null;

  if (question.type === 'mcq') {
    return (
      <div className="space-y-3">
        {question.options.map(opt => (
          <button
            key={opt.label}
            onClick={() => onAnswer(opt.label)}
            className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-150 flex items-center gap-4
              ${answer === opt.label
                ? 'border-brand-400 bg-brand-500/15 text-white'
                : 'border-surface-border bg-surface-muted text-gray-300 hover:border-brand-500/50 hover:text-white'
              }`}
          >
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0
              ${answer === opt.label ? 'bg-brand-500 text-white' : 'bg-surface-border text-gray-400'}`}>
              {opt.label}
            </span>
            <span>{opt.text}</span>
            {answer === opt.label && <CheckCircle className="w-4 h-4 text-brand-400 ml-auto flex-shrink-0" />}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === 'true_false') {
    return (
      <div className="grid grid-cols-2 gap-4">
        {['true', 'false'].map(val => (
          <button
            key={val}
            onClick={() => onAnswer(val)}
            className={`py-6 rounded-xl border text-lg font-bold transition-all duration-150 capitalize
              ${answer === val
                ? val === 'true'
                  ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
                  : 'border-red-400 bg-red-500/15 text-red-300'
                : 'border-surface-border bg-surface-muted text-gray-400 hover:border-gray-500 hover:text-white'
              }`}
          >
            {val === 'true' ? '✓ True' : '✗ False'}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === 'fill_blank') {
    return (
      <div>
        <input
          type="text"
          className="input text-lg"
          placeholder="Type your answer here..."
          value={answer || ''}
          onChange={e => onAnswer(e.target.value)}
          autoFocus
        />
        <p className="text-xs text-gray-500 mt-2">Type the exact answer</p>
      </div>
    );
  }

  if (question.type === 'open_ended') {
    return (
      <div>
        <textarea
          className="input resize-none min-h-[160px]"
          placeholder="Write your answer in detail..."
          value={answer || ''}
          onChange={e => onAnswer(e.target.value)}
          autoFocus
        />
        <p className="text-xs text-gray-500 mt-2">This answer will be reviewed manually.</p>
      </div>
    );
  }

  return null;
}

// ─── Main Quiz Page ───────────────────────────────────────────────────────────
export default function QuizPage() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(location.state?.attempt || null);
  const [session, setSession] = useState(location.state?.session || null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedAnswer }
  const [loading, setLoading] = useState(!location.state?.attempt);
  const [submitting, setSubmitting] = useState(false);
  const [terminated, setTerminated] = useState(false);
  const answerSaveTimeout = useRef({});
  const terminatedRef = useRef(false);

  // Load attempt if no state passed
  useEffect(() => {
    if (!attempt) {
      api.get(`/attempts/${attemptId}/result`).catch(() => {
        navigate('/dashboard');
      });
    }
    setLoading(false);
  }, [attempt, attemptId, navigate]);

  // Restore existing answers
  useEffect(() => {
    if (attempt?.answers) {
      const map = {};
      attempt.answers.forEach(a => { map[a.question] = a.selectedAnswer; });
      setAnswers(map);
    }
  }, [attempt]);

  // ── ANTI-CHEAT ──────────────────────────────────────────────────────────────
  const handleViolation = useCallback(async (reason) => {
    if (terminatedRef.current || submitting) return;
    terminatedRef.current = true;
    setTerminated(true);

    try {
      await api.post(`/attempts/${attemptId}/terminate`, { reason });
    } catch {}

    navigate('/terminated', { replace: true, state: { reason, attemptId } });
  }, [attemptId, submitting, navigate]);

  useEffect(() => {
    if (terminated) return;

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleViolation('TAB_SWITCH');
      }
    };

    const handleBlur = () => {
      // Small delay to ignore accidental focus loss (e.g., browser address bar click)
      setTimeout(() => {
        if (document.visibilityState === 'hidden') {
          handleViolation('WINDOW_BLUR');
        }
      }, 300);
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Leaving this page will terminate your quiz session!';
      return e.returnValue;
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleViolation, terminated]);
  // ───────────────────────────────────────────────────────────────────────────

  const handleExpire = useCallback(async () => {
    if (terminatedRef.current) return;
    terminatedRef.current = true;
    toast.error('Time is up! Auto-submitting...');
    try {
      await api.post(`/attempts/${attemptId}/submit`);
      navigate(`/result/${attemptId}`);
    } catch {
      navigate('/dashboard');
    }
  }, [attemptId, navigate]);

  const { display: timerDisplay, seconds: timerSeconds, isWarning } = useTimer(
    attempt?.expiresAt,
    handleExpire
  );

  const questions = session?.questions || [];
  const currentQ = questions[currentIdx];
  const currentAnswer = answers[currentQ?._id];

  const handleAnswer = useCallback((value) => {
    if (!currentQ) return;
    const qId = currentQ._id;
    setAnswers(prev => ({ ...prev, [qId]: value }));

    // Debounced save to backend
    clearTimeout(answerSaveTimeout.current[qId]);
    answerSaveTimeout.current[qId] = setTimeout(async () => {
      try {
        await api.post(`/attempts/${attemptId}/answer`, {
          questionId: qId,
          selectedAnswer: value,
        });
      } catch {}
    }, 600);
  }, [currentQ, attemptId]);

  const handleSubmit = async () => {
    const unanswered = questions.filter(q => !answers[q._id]).length;
    if (unanswered > 0) {
      const confirmed = window.confirm(
        `You have ${unanswered} unanswered question(s). Submit anyway?`
      );
      if (!confirmed) return;
    }

    setSubmitting(true);
    terminatedRef.current = true; // Prevent anti-cheat from firing during submit

    try {
      // Save any pending answers first
      const savePromises = Object.entries(answers).map(([questionId, selectedAnswer]) =>
        api.post(`/attempts/${attemptId}/answer`, { questionId, selectedAnswer }).catch(() => {})
      );
      await Promise.all(savePromises);

      await api.post(`/attempts/${attemptId}/submit`);
      toast.success('Quiz submitted successfully!');
      navigate(`/result/${attemptId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
      setSubmitting(false);
      terminatedRef.current = false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400">Session data unavailable.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary mt-4">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  const answeredCount = questions.filter(q => answers[q._id]).length;
  const progressPct = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top bar */}
      <header className="border-b border-surface-border bg-surface-card px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-10">
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-white truncate">{session.name}</p>
          <p className="text-xs text-gray-500">{answeredCount}/{questions.length} answered</p>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-xl
          ${isWarning
            ? 'bg-red-500/15 text-red-400 border border-red-500/30 timer-warning'
            : 'bg-surface-muted text-white border border-surface-border'
          }`}>
          <Clock className="w-4 h-4" />
          {timerDisplay}
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-surface-muted">
        <div
          className="h-full bg-brand-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question navigator sidebar — desktop */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-surface-border bg-surface-card p-4 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Questions</p>
          <div className="grid grid-cols-4 gap-1.5">
            {questions.map((q, i) => (
              <button
                key={q._id}
                onClick={() => setCurrentIdx(i)}
                className={`w-full aspect-square rounded-lg text-xs font-bold transition-all
                  ${i === currentIdx
                    ? 'bg-brand-500 text-white'
                    : answers[q._id]
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-surface-muted text-gray-500 hover:text-white'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-4 space-y-1.5 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-brand-500" /> Current
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" /> Answered
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-surface-muted" /> Unanswered
            </div>
          </div>
        </aside>

        {/* Main question area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-2xl mx-auto">
            {/* Anti-cheat warning banner */}
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 mb-6 text-xs text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              Do not switch tabs or leave this window — your session will be terminated.
            </div>

            {/* Question */}
            <div className="card p-6 lg:p-8 mb-6 animate-fade-in" key={currentQ?._id}>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono text-gray-500">Q{currentIdx + 1} of {questions.length}</span>
                    <span className={`badge-${currentQ?.type === 'true_false' ? 'tf' : currentQ?.type === 'fill_blank' ? 'fib' : currentQ?.type === 'open_ended' ? 'oe' : 'mcq'}`}>
                      {currentQ?.type === 'mcq' ? 'MCQ' : currentQ?.type === 'true_false' ? 'True/False' : currentQ?.type === 'fill_blank' ? 'Fill in the Blank' : 'Open Ended'}
                    </span>
                  </div>
                  <p className="text-white text-lg leading-relaxed font-medium">{currentQ?.text}</p>
                </div>
              </div>

              <QuestionCard
                question={currentQ}
                answer={currentAnswer}
                onAnswer={handleAnswer}
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {/* Mobile question dots */}
              <div className="flex gap-1 lg:hidden overflow-x-auto max-w-[160px]">
                {questions.slice(Math.max(0, currentIdx - 2), currentIdx + 3).map((q, offset) => {
                  const realIdx = Math.max(0, currentIdx - 2) + offset;
                  return (
                    <button
                      key={q._id}
                      onClick={() => setCurrentIdx(realIdx)}
                      className={`w-2 h-2 rounded-full flex-shrink-0 transition-all
                        ${realIdx === currentIdx ? 'bg-brand-400 w-4' : answers[q._id] ? 'bg-emerald-400' : 'bg-gray-600'}`}
                    />
                  );
                })}
              </div>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(i => Math.min(questions.length - 1, i + 1))}
                  className="btn-primary flex items-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  {submitting
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
