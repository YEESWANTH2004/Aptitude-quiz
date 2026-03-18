import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import api from '../utils/api';
import { CheckCircle, XCircle, MinusCircle, Trophy, Clock, AlertTriangle, ChevronDown, ChevronUp, LayoutDashboard } from 'lucide-react';
import { formatDuration, intervalToDuration } from 'date-fns';

const typeLabel = { mcq: 'MCQ', true_false: 'True/False', fill_blank: 'Fill in Blank', open_ended: 'Open Ended' };

export default function ResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get(`/attempts/${attemptId}/result`)
      .then(r => setAttempt(r.data.attempt))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [attemptId, navigate]);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );

  if (!attempt) return null;

  const pct = attempt.totalQuestions > 0
    ? Math.round((attempt.score / attempt.totalQuestions) * 100)
    : 0;

  const timeTaken = attempt.startedAt && attempt.submittedAt
    ? intervalToDuration({ start: new Date(attempt.startedAt), end: new Date(attempt.submittedAt) })
    : null;

  const statusColors = {
    SUBMITTED: 'text-emerald-400',
    TERMINATED: 'text-red-400',
    TIMED_OUT: 'text-amber-400',
  };

  const scoreColor = pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400';
  const scoreRing = pct >= 80 ? 'border-emerald-400' : pct >= 50 ? 'border-amber-400' : 'border-red-400';

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-white">Quiz Result</h1>
          <p className="text-gray-500 mt-1">{attempt.session?.name}</p>
        </div>

        {/* Score card */}
        <div className="card p-8 mb-6 flex flex-col sm:flex-row items-center gap-8">
          {/* Ring */}
          <div className={`relative w-32 h-32 rounded-full border-8 ${scoreRing} flex items-center justify-center flex-shrink-0`}>
            <div className="text-center">
              <p className={`text-3xl font-display font-bold ${scoreColor}`}>{pct}%</p>
              <p className="text-xs text-gray-500">{attempt.score}/{attempt.totalQuestions}</p>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div className="bg-surface-muted rounded-xl p-4">
              <Trophy className="w-4 h-4 text-amber-400 mb-1" />
              <p className="text-lg font-bold text-white">{attempt.score}</p>
              <p className="text-xs text-gray-500">Correct</p>
            </div>
            <div className="bg-surface-muted rounded-xl p-4">
              <XCircle className="w-4 h-4 text-red-400 mb-1" />
              <p className="text-lg font-bold text-white">{attempt.totalQuestions - attempt.score}</p>
              <p className="text-xs text-gray-500">Incorrect / Skipped</p>
            </div>
            <div className="bg-surface-muted rounded-xl p-4">
              <Clock className="w-4 h-4 text-brand-400 mb-1" />
              <p className="text-lg font-bold text-white">
                {timeTaken ? formatDuration(timeTaken, { format: ['minutes', 'seconds'] }) : '—'}
              </p>
              <p className="text-xs text-gray-500">Time Taken</p>
            </div>
            <div className="bg-surface-muted rounded-xl p-4">
              <span className={`text-sm font-bold ${statusColors[attempt.status] || 'text-gray-400'}`}>
                {attempt.status}
              </span>
              <p className="text-xs text-gray-500 mt-1">Status</p>
            </div>
          </div>
        </div>

        {/* Violations */}
        {attempt.violations?.length > 0 && (
          <div className="card p-5 mb-6 border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="font-semibold text-red-400">Violations Detected</p>
            </div>
            {attempt.violations.map((v, i) => (
              <div key={i} className="text-sm text-gray-400 flex justify-between">
                <span>{v.reason}</span>
                <span className="text-gray-500">{new Date(v.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Question breakdown */}
        <div className="card mb-6">
          <div className="p-6 border-b border-surface-border">
            <h2 className="font-display text-lg font-semibold text-white">Answer Breakdown</h2>
          </div>
          <div className="divide-y divide-surface-border">
            {attempt.answers.map((ans, i) => {
              const q = ans.question;
              const isOpen = q?.type === 'open_ended';
              const isCorrect = ans.isCorrect;
              const isExpanded = expanded === i;

              return (
                <div key={i} className="p-5">
                  <div
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : i)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {isOpen
                        ? <MinusCircle className="w-5 h-5 text-gray-500" />
                        : isCorrect
                          ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                          : <XCircle className="w-5 h-5 text-red-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">Q{i + 1}</span>
                        <span className={`badge-${q?.type === 'true_false' ? 'tf' : q?.type === 'fill_blank' ? 'fib' : q?.type === 'open_ended' ? 'oe' : 'mcq'}`}>
                          {typeLabel[q?.type]}
                        </span>
                      </div>
                      <p className="text-white text-sm">{q?.text}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                  </div>

                  {isExpanded && (
                    <div className="mt-4 ml-8 space-y-2 text-sm animate-fade-in">
                      <div className="flex gap-2">
                        <span className="text-gray-500 w-28 flex-shrink-0">Your answer:</span>
                        <span className={isOpen ? 'text-gray-300' : isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                          {ans.selectedAnswer || <span className="text-gray-600 italic">Not answered</span>}
                        </span>
                      </div>
                      {!isOpen && (
                        <div className="flex gap-2">
                          <span className="text-gray-500 w-28 flex-shrink-0">Correct answer:</span>
                          <span className="text-emerald-400">{q?.correctAnswer}</span>
                        </div>
                      )}
                      {q?.explanation && (
                        <div className="bg-surface-muted rounded-lg p-3 mt-2">
                          <p className="text-xs text-gray-500 font-semibold mb-1">Explanation</p>
                          <p className="text-gray-300 text-xs">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={() => navigate('/dashboard')} className="btn-secondary inline-flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </Layout>
  );
}
