import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldX, AlertTriangle, LayoutDashboard } from 'lucide-react';

const reasonLabels = {
  TAB_SWITCH: 'You switched to another tab',
  WINDOW_BLUR: 'You left the quiz window',
  MANUAL: 'Session terminated by administrator',
};

export default function TerminatedPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const reason = state?.reason || 'TAB_SWITCH';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/15 border border-red-500/30 rounded-full mb-6">
          <ShieldX className="w-10 h-10 text-red-400" />
        </div>

        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Session Terminated
        </h1>
        <p className="text-gray-400 mb-6">
          Your quiz session has been automatically terminated due to a violation.
        </p>

        <div className="card p-5 mb-6 text-left">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white mb-1">Reason</p>
              <p className="text-sm text-gray-400">{reasonLabels[reason] || 'Anti-cheat violation detected'}</p>
            </div>
          </div>
        </div>

        <div className="card p-5 mb-8 text-left space-y-2">
          <p className="text-sm font-semibold text-white">What happened?</p>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Your answers up to this point have been saved</li>
            <li>• This violation has been logged and reported</li>
            <li>• You may not be able to re-attempt this session</li>
          </ul>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <LayoutDashboard className="w-4 h-4" />
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
