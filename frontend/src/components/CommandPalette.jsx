import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext';
import { useTheme } from '../contexts/ThemeContext';

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary-100 text-primary-700 rounded-sm">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function CommandPalette({ tasks = [], onClose }) {
  const navigate = useNavigate();
  const { openQuickCapture, openShortcutHelp } = useUI();
  const { isDark, setTheme } = useTheme();

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const items = useMemo(() => {
    const q = query.toLowerCase();

    const navItems = [
      { id: 'nav-today', group: 'Navigate', label: 'Go to Today', action: () => { navigate('/today'); onClose(); } },
      { id: 'nav-tasks', group: 'Navigate', label: 'Go to Tasks', action: () => { navigate('/tasks'); onClose(); } },
      { id: 'nav-dashboard', group: 'Navigate', label: 'Go to Dashboard', action: () => { navigate('/dashboard'); onClose(); } },
      { id: 'nav-settings', group: 'Navigate', label: 'Go to Settings', action: () => { navigate('/settings'); onClose(); } },
    ];

    const actionItems = [
      { id: 'new-task', group: 'Actions', label: 'New Task', shortcut: ['N'], action: () => { onClose(); openQuickCapture(); } },
      { id: 'shortcuts', group: 'Actions', label: 'Keyboard Shortcuts', shortcut: ['?'], action: () => { onClose(); openShortcutHelp(); } },
      {
        id: 'theme', group: 'Preferences',
        label: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        action: () => { setTheme(isDark ? 'light' : 'dark'); onClose(); },
      },
    ];

    const taskItems = (tasks || [])
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 5)
      .map((t) => ({
        id: `task-${t.id}`,
        group: 'Tasks',
        label: t.title,
        meta: t.status,
        action: () => { navigate('/tasks'); onClose(); },
      }));

    const all = [...navItems, ...actionItems, ...taskItems];

    if (!q) return all;

    return all.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    );
  }, [query, tasks, isDark, navigate, onClose, openQuickCapture, openShortcutHelp, setTheme]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    function handler(e) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        items[activeIndex]?.action();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [items, activeIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIndex];
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const groups = [...new Set(items.map((i) => i.group))];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or jump to…"
            className="flex-1 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none border-0"
          />
          <span className="kbd hidden md:inline-flex">Esc</span>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2" ref={listRef}>
          {items.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No results</p>
          )}
          {groups.map((group) => {
            const groupItems = items.filter((i) => i.group === group);
            return (
              <div key={group}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-1.5">
                  {group}
                </p>
                {groupItems.map((item) => {
                  const globalIdx = items.indexOf(item);
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                        globalIdx === activeIndex ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex-1">{highlight(item.label, query)}</span>
                      {item.shortcut && (
                        <div className="flex items-center gap-0.5">
                          {(Array.isArray(item.shortcut) ? item.shortcut : [item.shortcut]).map((k, i) => (
                            <span key={i} className="kbd">{k}</span>
                          ))}
                        </div>
                      )}
                      {item.meta && (
                        <span className="text-xs text-gray-400 capitalize">{item.meta.replace('_', ' ')}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-400">
          <span><span className="kbd">↑↓</span> navigate</span>
          <span><span className="kbd">↵</span> select</span>
          <span><span className="kbd">Esc</span> close</span>
        </div>
      </div>
    </div>
  );
}
