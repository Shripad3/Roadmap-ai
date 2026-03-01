import { useState, useEffect } from 'react';
import * as api from '../services/api';

export default function AIBreakdownPreviewModal({ taskId, initialSubtasks, onSaved, onClose }) {
  const [subtasks, setSubtasks] = useState(
    initialSubtasks.map((s, i) => ({ ...s, _key: i }))
  );
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const busy = isRegenerating || isSaving;

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [busy, onClose]);

  function updateSubtask(key, field, value) {
    setSubtasks((prev) =>
      prev.map((s) => (s._key === key ? { ...s, [field]: value } : s))
    );
  }

  function deleteSubtask(key) {
    setSubtasks((prev) => prev.filter((s) => s._key !== key));
  }

  async function handleRegenerate() {
    setIsRegenerating(true);
    setError(null);
    try {
      const fresh = await api.fetchAIBreakdown(taskId);
      setSubtasks(fresh.map((s, i) => ({ ...s, _key: i })));
    } catch (err) {
      setError(err.message || 'Failed to regenerate. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  }

  async function handleSave() {
    const valid = subtasks.filter((s) => s.title?.trim());
    if (valid.length === 0) {
      setError('Add at least one subtask before saving.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const saved = await api.saveSubtasks(taskId, valid);
      onSaved(saved);
    } catch (err) {
      setError(err.message || 'Failed to save subtasks. Please try again.');
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/40"
        onClick={() => !busy && onClose()}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg border border-gray-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Breakdown Preview</h3>
            <p className="text-sm text-gray-500">
              Review and edit subtasks before saving. {subtasks.length} subtask{subtasks.length !== 1 ? 's' : ''} generated.
            </p>
          </div>
          <button
            onClick={() => !busy && onClose()}
            className="p-2 rounded-md hover:bg-gray-50 text-gray-500"
            disabled={busy}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Subtask list */}
        <div className="overflow-y-auto px-5 py-4 space-y-3 flex-1">
          {subtasks.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No subtasks. Click "Regenerate" to try again.
            </p>
          ) : (
            subtasks.map((subtask) => (
              <div
                key={subtask._key}
                className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50"
              >
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    value={subtask.title || ''}
                    onChange={(e) => updateSubtask(subtask._key, 'title', e.target.value)}
                    disabled={busy}
                    placeholder="Subtask title"
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white disabled:opacity-60"
                  />
                  <button
                    onClick={() => deleteSubtask(subtask._key)}
                    disabled={busy}
                    title="Remove subtask"
                    className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-40 shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {subtask.description !== undefined && (
                  <textarea
                    value={subtask.description || ''}
                    onChange={(e) => updateSubtask(subtask._key, 'description', e.target.value)}
                    disabled={busy}
                    placeholder="Description (optional)"
                    rows={2}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white disabled:opacity-60 resize-none"
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shrink-0">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between shrink-0">
          <button
            onClick={handleRegenerate}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-60"
          >
            {isRegenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Regenerating...
              </>
            ) : (
              'Regenerate'
            )}
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => !busy && onClose()}
              disabled={busy}
              className="px-4 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={busy}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-60 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                `Save ${subtasks.length} subtask${subtasks.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
