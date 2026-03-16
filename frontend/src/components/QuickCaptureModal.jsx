import { useState, useEffect, useRef } from 'react';
import * as api from '../services/api';
import { useUI } from '../contexts/UIContext';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'text-green-600' },
  { value: 'medium', label: 'Med', color: 'text-amber-600' },
  { value: 'high', label: 'High', color: 'text-red-600' },
];

export default function QuickCaptureModal({ onClose }) {
  const { quickCaptureCallback, reloadTasks } = useUI();

  const [stage, setStage] = useState('input'); // 'input' | 'preview'
  const [inputText, setInputText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [showDescription, setShowDescription] = useState(false);

  const [parsed, setParsed] = useState({
    title: '',
    priority: 'medium',
    due_date: '',
    estimated_hours: '',
    description: '',
  });

  const inputRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    if (stage === 'input') inputRef.current?.focus();
    if (stage === 'preview') titleRef.current?.focus();
  }, [stage]);

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleQuickAdd() {
    const title = inputText.trim();
    if (!title) return;
    setIsSaving(true);
    try {
      await api.createTask({ title, priority: 'medium' });
      if (quickCaptureCallback) quickCaptureCallback();
      reloadTasks();
      onClose();
    } catch (err) {
      setParseError(err.message || 'Failed to create task');
      setIsSaving(false);
    }
  }

  async function handleParseWithAI() {
    const text = inputText.trim();
    if (!text) return;
    setIsParsing(true);
    setParseError(null);
    try {
      const result = await api.parseTaskNaturalLanguage(text);
      setParsed({
        title: result.title || text,
        priority: result.priority || 'medium',
        due_date: result.due_date || '',
        estimated_hours: result.estimated_hours != null ? String(result.estimated_hours) : '',
        description: result.description || '',
      });
      if (result.description) setShowDescription(true);
      setStage('preview');
    } catch (err) {
      setParseError(err.message || 'AI parsing failed. Try again or use Quick Add.');
    } finally {
      setIsParsing(false);
    }
  }

  async function handleCreate() {
    const title = parsed.title.trim();
    if (!title) return;
    setIsSaving(true);
    try {
      await api.createTask({
        title,
        priority: parsed.priority || 'medium',
        due_date: parsed.due_date || null,
        estimated_hours: parsed.estimated_hours ? parseFloat(parsed.estimated_hours) : null,
        description: parsed.description?.trim() || null,
      });
      if (quickCaptureCallback) quickCaptureCallback();
      reloadTasks();
      onClose();
    } catch (err) {
      setParseError(err.message || 'Failed to create task');
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={stage === 'input' ? onClose : undefined}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {stage === 'input' ? (
          <div className="p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              New Task
            </p>
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setParseError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleQuickAdd();
                }
              }}
              placeholder="Describe your task… e.g. Fix the login bug by Friday, high priority"
              rows={3}
              className="w-full text-base text-gray-900 placeholder-gray-400 resize-none border-0 outline-none focus:ring-0 bg-transparent"
            />
            {parseError && (
              <p className="text-sm text-red-500 mt-1">{parseError}</p>
            )}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={handleQuickAdd}
                disabled={!inputText.trim() || isSaving}
                className="btn btn-primary disabled:opacity-50"
              >
                {isSaving ? 'Adding…' : 'Quick Add'}
              </button>
              <button
                onClick={handleParseWithAI}
                disabled={!inputText.trim() || isParsing}
                className="btn btn-secondary disabled:opacity-50 flex items-center gap-1.5"
              >
                {isParsing ? (
                  <>
                    <span className="inline-block w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    Parsing…
                  </>
                ) : (
                  <>
                    <span>✦</span> Parse with AI
                  </>
                )}
              </button>
              <span className="ml-auto text-xs text-gray-400">↵ Quick Add &nbsp;·&nbsp; Esc close</span>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                ✦ AI Preview — edit if needed
              </p>
              <button
                onClick={() => { setStage('input'); setParseError(null); }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                ← Edit again
              </button>
            </div>

            {/* Title */}
            <input
              ref={titleRef}
              type="text"
              value={parsed.title}
              onChange={(e) => setParsed((p) => ({ ...p, title: e.target.value }))}
              className="w-full text-lg font-semibold text-gray-900 border-0 border-b border-gray-200 outline-none focus:border-primary-500 bg-transparent pb-2 mb-4"
              placeholder="Task title"
            />

            {/* Fields row */}
            <div className="flex flex-wrap gap-4 mb-4">
              {/* Priority */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Priority</p>
                <div className="flex gap-1">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setParsed((p) => ({ ...p, priority: opt.value }))}
                      className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
                        parsed.priority === opt.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due date */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Due date</p>
                <input
                  type="date"
                  value={parsed.due_date}
                  onChange={(e) => setParsed((p) => ({ ...p, due_date: e.target.value }))}
                  className="text-sm border border-gray-200 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Hours */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Est. hours</p>
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={parsed.estimated_hours}
                  onChange={(e) => setParsed((p) => ({ ...p, estimated_hours: e.target.value }))}
                  placeholder="—"
                  className="text-sm border border-gray-200 rounded px-2 py-1 w-20 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Description toggle */}
            {!showDescription ? (
              <button
                onClick={() => setShowDescription(true)}
                className="text-xs text-gray-400 hover:text-gray-600 mb-4"
              >
                + Add description
              </button>
            ) : (
              <textarea
                value={parsed.description}
                onChange={(e) => setParsed((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description (optional)"
                rows={2}
                className="w-full text-sm text-gray-700 border border-gray-200 rounded p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500 mb-4"
              />
            )}

            {parseError && (
              <p className="text-sm text-red-500 mb-3">{parseError}</p>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={handleCreate}
                disabled={!parsed.title.trim() || isSaving}
                className="btn btn-primary disabled:opacity-50"
              >
                {isSaving ? 'Creating…' : 'Create Task'}
              </button>
              <button onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
