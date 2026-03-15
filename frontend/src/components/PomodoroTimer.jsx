import { useState, useEffect } from 'react';

const PRESETS = {
  '25/5':  { work: 25, break: 5 },
  '50/10': { work: 50, break: 10 },
};

export default function PomodoroTimer() {
  const [preset, setPreset] = useState('25/5');
  const [customWork, setCustomWork] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);
  const [phase, setPhase] = useState('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const workMins  = preset === 'custom' ? (Number(customWork)  || 25) : PRESETS[preset].work;
  const breakMins = preset === 'custom' ? (Number(customBreak) || 5)  : PRESETS[preset].break;
  const totalSecs = phase === 'work' ? workMins * 60 : breakMins * 60;
  const progress  = totalSecs > 0 ? ((totalSecs - timeLeft) / totalSecs) * 100 : 0;

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsRunning(false);
          setPhase((p) => {
            const next = p === 'work' ? 'break' : 'work';
            if (p === 'work') setSessions((s) => s + 1);
            setTimeout(() => {
              setTimeLeft(next === 'break' ? breakMins * 60 : workMins * 60);
              setIsRunning(true);
            }, 0);
            return next;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, workMins, breakMins]);

  function handlePresetChange(p) {
    setPreset(p);
    setIsRunning(false);
    setPhase('work');
    const mins = p === 'custom' ? customWork : PRESETS[p].work;
    setTimeLeft((Number(mins) || 25) * 60);
  }

  function handleRestart() {
    setIsRunning(false);
    setTimeLeft(phase === 'work' ? workMins * 60 : breakMins * 60);
  }

  function handleForceBreak() {
    setPhase('break');
    setTimeLeft(breakMins * 60);
    setIsRunning(true);
  }

  function handleCustomChange(field, val) {
    if (field === 'work') setCustomWork(val);
    else setCustomBreak(val);
    setIsRunning(false);
    setPhase('work');
    setTimeLeft((field === 'work' ? Number(val) : customWork) * 60 || 25 * 60);
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const isWork = phase === 'work';

  return (
    <div className="flex flex-col gap-3">
      {/* Preset selector */}
      <div className="flex gap-1.5 flex-wrap">
        {Object.keys(PRESETS).map((p) => (
          <button
            key={p}
            onClick={() => handlePresetChange(p)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              preset === p ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p} min
          </button>
        ))}
        <button
          onClick={() => handlePresetChange('custom')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            preset === 'custom' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Custom inputs */}
      {preset === 'custom' && (
        <div className="flex gap-2 items-center">
          <label className="text-xs text-gray-500">Work</label>
          <input
            type="number" min="1" max="120"
            value={customWork}
            onChange={(e) => handleCustomChange('work', e.target.value)}
            className="w-14 px-2 py-1 text-xs border border-gray-300 rounded-md text-center"
          />
          <label className="text-xs text-gray-500">Break</label>
          <input
            type="number" min="1" max="60"
            value={customBreak}
            onChange={(e) => handleCustomChange('break', e.target.value)}
            className="w-14 px-2 py-1 text-xs border border-gray-300 rounded-md text-center"
          />
          <span className="text-xs text-gray-400">min</span>
        </div>
      )}

      {/* Phase label */}
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${isWork ? 'bg-primary-600' : 'bg-green-500'}`} />
        <span className={`text-xs font-semibold uppercase tracking-wider ${isWork ? 'text-primary-600' : 'text-green-600'}`}>
          {isWork ? 'Work' : 'Break'}
        </span>
      </div>

      {/* Clock */}
      <div className={`text-5xl font-mono font-bold tabular-nums ${isWork ? 'text-gray-900' : 'text-green-600'}`}>
        {mins}:{secs}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-1000 ${isWork ? 'bg-primary-600' : 'bg-green-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setIsRunning((r) => !r)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isRunning ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {isRunning ? (
            <><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>Pause</>
          ) : (
            <><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Start</>
          )}
        </button>

        <button
          onClick={handleRestart}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          title="Restart current phase"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115 0M20 15a9 9 0 01-15 0"/>
          </svg>
          Restart
        </button>

        {isWork && (
          <button
            onClick={handleForceBreak}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
            title="Skip to break now"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/></svg>
            Break
          </button>
        )}
      </div>

      {/* Session counter */}
      {sessions > 0 && (
        <p className="text-xs text-gray-400">
          {sessions} session{sessions !== 1 ? 's' : ''} completed today
        </p>
      )}
    </div>
  );
}
