import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import PomodoroTimer from '../components/PomodoroTimer';

const PRIORITY_COLORS = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-green-100 text-green-700',
};

function getGreeting(name) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${greeting}, ${name}`;
}

export default function Today() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [saving, setSaving] = useState(false);

  const username = user?.email?.split('@')[0] ?? 'there';

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  useEffect(() => {
    api.getTasks()
      .then(setTasks)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const overdue = tasks.filter((t) => {
    if (!t.due_date || t.status === 'completed') return false;
    const [y, m, d] = t.due_date.split('-').map(Number);
    return new Date(y, m - 1, d) < todayDate;
  });

  const dueToday = tasks.filter((t) => {
    if (!t.due_date || t.status === 'completed') return false;
    return t.due_date === todayStr;
  });

  async function handleQuickAdd(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const task = await api.createTask({ title: newTitle.trim(), priority: newPriority, status: 'pending' });
      setTasks((prev) => [task, ...prev]);
      setNewTitle('');
      setNewPriority('medium');
      setShowQuickAdd(false);
      // fire-and-forget AI estimate
      if (task?.id) {
        api.estimateTaskHours(task.title, '').then((hours) => {
          if (hours) api.updateTask(task.id, { estimated_hours: hours }).catch(() => {});
        }).catch(() => {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const totalDue = overdue.length + dueToday.length;

  return (
    <div className="space-y-4 pb-4">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{getGreeting(username)}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {totalDue === 0
            ? 'You\'re all caught up today.'
            : `${totalDue} task${totalDue !== 1 ? 's' : ''} need${totalDue === 1 ? 's' : ''} your attention.`}
        </p>
      </div>

      {/* Pomodoro */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Pomodoro Timer</h2>
        <PomodoroTimer />
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <div className="bg-white border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <h2 className="font-semibold text-red-700">Overdue</h2>
            <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
              {overdue.length}
            </span>
          </div>
          <div className="space-y-2">
            {overdue.map((task) => (
              <TaskRow key={task.id} task={task} onClick={() => navigate('/tasks')} />
            ))}
          </div>
        </div>
      )}

      {/* Due today */}
      {dueToday.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-primary-500" />
            <h2 className="font-semibold text-gray-900">Due Today</h2>
            <span className="ml-auto text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
              {dueToday.length}
            </span>
          </div>
          <div className="space-y-2">
            {dueToday.map((task) => (
              <TaskRow key={task.id} task={task} onClick={() => navigate('/tasks')} />
            ))}
          </div>
        </div>
      )}

      {/* All clear */}
      {totalDue === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">✓</div>
          <p className="font-semibold text-gray-700">All clear!</p>
          <p className="text-sm text-gray-500 mt-1">No tasks due today. Add one below or check your task list.</p>
        </div>
      )}

      {/* Quick add modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setShowQuickAdd(false)}>
          <div className="w-full bg-white rounded-t-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 mb-4">New Task</h3>
            <form onSubmit={handleQuickAdd} className="space-y-3">
              <input
                autoFocus
                type="text"
                placeholder="Task title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="high">High priority</option>
                <option value="medium">Medium priority</option>
                <option value="low">Low priority</option>
              </select>
              <button
                type="submit"
                disabled={saving || !newTitle.trim()}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium text-sm disabled:opacity-50"
              >
                {saving ? 'Adding…' : 'Add Task'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-20 right-5 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-primary-700 active:scale-95 transition-transform z-20"
        aria-label="Add task"
      >
        +
      </button>
    </div>
  );
}

function TaskRow({ task, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-2 text-left group"
    >
      <span className={`shrink-0 w-2 h-2 rounded-full ${
        task.status === 'completed' ? 'bg-green-500' :
        task.status === 'in_progress' ? 'bg-blue-400' : 'bg-gray-300'
      }`} />
      <span className="flex-1 text-sm text-gray-800 truncate group-hover:text-primary-600">{task.title}</span>
      {task.priority && (
        <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority] ?? ''}`}>
          {task.priority[0].toUpperCase() + task.priority.slice(1)}
        </span>
      )}
      <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
