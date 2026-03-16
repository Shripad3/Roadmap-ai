import { useEffect } from 'react';

const SHORTCUTS = [
  { group: 'Actions', keys: ['N'], description: 'New task (Quick Capture)' },
  { group: 'Actions', keys: ['⌘', 'K'], description: 'Command palette' },
  { group: 'Actions', keys: ['?'], description: 'Show keyboard shortcuts' },
  { group: 'Navigate', keys: ['G', 'T'], description: 'Go to Today' },
  { group: 'Navigate', keys: ['G', 'A'], description: 'Go to Tasks' },
  { group: 'Navigate', keys: ['G', 'D'], description: 'Go to Dashboard' },
  { group: 'General', keys: ['Esc'], description: 'Close modal / dismiss' },
];

export default function KeyboardShortcutHelp({ onClose }) {
  useEffect(() => {
    function handler(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const groups = [...new Set(SHORTCUTS.map((s) => s.group))];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        </div>
        <div className="p-5 space-y-4">
          {groups.map((group) => (
            <div key={group}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{group}</p>
              <div className="space-y-1.5">
                {SHORTCUTS.filter((s) => s.group === group).map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{s.description}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k, j) => (
                        <span key={j} className="kbd">{k}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
