import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import api from '../utils/api';
import { KeyRound, ArrowRight, Clock, Hash, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JoinQuizPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: enter code, 2: confirm, 3: passcode
  const [code, setCode] = useState('');
  const [passcode, setPasscode] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/sessions/code/${code.trim().toUpperCase()}`);
      setSession(data.session);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Session not found');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/attempts/start', {
        sessionCode: code.trim().toUpperCase(),
        passcode: passcode || undefined,
      });
      toast.success(data.resumed ? 'Resuming your attempt...' : 'Quiz started! Good luck!');
      navigate(`/quiz/${data.attempt._id}`, { state: { attempt: data.attempt, session: data.session } });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to start quiz';
      if (msg.toLowerCase().includes('passcode')) setStep(3);
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-white">Join a Quiz</h1>
          <p className="text-gray-500 mt-1">Enter the session code provided by your instructor</p>
        </div>

        {step === 1 && (
          <div className="card p-8 animate-slide-up">
            <div className="flex items-center justify-center w-14 h-14 bg-brand-500/15 rounded-2xl mb-6 mx-auto">
              <Hash className="w-7 h-7 text-brand-400" />
            </div>
            <form onSubmit={handleLookup} className="space-y-5">
              <div>
                <label className="label">Session Code</label>
                <input
                  type="text"
                  className="input text-center text-xl font-mono tracking-widest uppercase"
                  placeholder="e.g. DEMO01"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading || !code.trim()}>
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? 'Looking up...' : 'Find Session'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && session && (
          <div className="card p-8 animate-slide-up space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-white">{session.name}</h2>
              {session.description && <p className="text-gray-400 mt-1 text-sm">{session.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-muted rounded-xl p-4 text-center">
                <Hash className="w-5 h-5 text-brand-400 mx-auto mb-1" />
                <p className="text-lg font-bold font-mono text-white">{session.questions?.length || 0}</p>
                <p className="text-xs text-gray-500">Questions</p>
              </div>
              <div className="bg-surface-muted rounded-xl p-4 text-center">
                <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{session.timeLimit} min</p>
                <p className="text-xs text-gray-500">Time Limit</p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
              <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-300">
                <p className="font-semibold mb-1">Anti-Cheat Active</p>
                <p className="text-amber-400/80">Switching tabs or leaving this window will immediately terminate your session. Stay focused!</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setStep(1); setSession(null); }} className="btn-secondary flex-1">
                Back
              </button>
              <button onClick={handleStart} className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={loading}>
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? 'Starting...' : 'Start Quiz'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card p-8 animate-slide-up space-y-5">
            <div className="flex items-center gap-3">
              <KeyRound className="w-6 h-6 text-brand-400" />
              <h2 className="font-display text-lg font-bold text-white">Passcode Required</h2>
            </div>
            <div>
              <label className="label">Enter Passcode</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
              <button onClick={handleStart} className="btn-primary flex-1" disabled={loading || !passcode}>
                {loading ? 'Verifying...' : 'Enter'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
