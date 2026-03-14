import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicTask } from '../services/publicApi';

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-green-100 text-green-700',
};
const PRIORITY_LABELS = { high: 'High', medium: 'Medium', low: 'Low' };

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};
const STATUS_LABELS = {
  pending: 'To Do',
  in_progress: 'In Progress',
  completed: 'Done',
};

function formatDueDate(due_date) {
  if (!due_date) return null;
  const [year, month, day] = due_date.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    isOverdue: date < today,
  };
}

export default function SharedTaskView() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPublicTask(taskId)
      .then(setTask)
      .catch(() => setError("This roadmap isn't public or doesn't exist."))
      .finally(() => setLoading(false));
  }, [taskId]);

  const completedCount = task?.subtasks?.filter((s) => s.status === 'completed').length ?? 0;
  const totalCount = task?.subtasks?.length ?? 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-primary-600 text-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
            Roadmap AI
          </Link>
          <span className="text-sm text-gray-400">Shared roadmap</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-2">Roadmap not found</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        )}

        {task && (
          <div className="space-y-6">
            {/* Task header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
              {task.description && (
                <p className="text-gray-600 mb-4">{task.description}</p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {task.priority && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
                    {PRIORITY_LABELS[task.priority]} Priority
                  </span>
                )}
                {task.due_date && (() => {
                  const due = formatDueDate(task.due_date);
                  return due ? (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${due.isOverdue && task.status !== 'completed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      Due {due.label}{due.isOverdue && task.status !== 'completed' ? ' (overdue)' : ''}
                    </span>
                  ) : null;
                })()}
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[task.status] || STATUS_COLORS.pending}`}>
                  {STATUS_LABELS[task.status] || task.status}
                </span>
              </div>
            </div>

            {/* Progress */}
            {totalCount > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">{completedCount}/{totalCount} subtasks</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{progressPct}% complete</p>
              </div>
            )}

            {/* Subtasks */}
            {totalCount > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-start gap-3 p-4">
                    <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${subtask.status === 'completed' ? 'bg-green-500' : subtask.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${subtask.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {subtask.title}
                      </p>
                      {subtask.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{subtask.description}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[subtask.status] || STATUS_COLORS.pending}`}>
                      {STATUS_LABELS[subtask.status] || subtask.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer CTA */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-gray-600 mb-3">Want to create your own roadmap with AI?</p>
          <Link
            to="/auth?mode=signup"
            className="inline-block px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition"
          >
            Create your own roadmap with AI →
          </Link>
        </div>
      </footer>
    </div>
  );
}
