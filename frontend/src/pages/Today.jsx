import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import taskDetail from '../components/TaskDetail';
import * as api from '../services/api';
import PomodoroTimer from '../components/PomodoroTimer';
import OnboardingModal from '../components/OnboardingModal';
import TaskDetail from '../components/TaskDetail';

const ONBOARDING_KEY = 'roadmap_onboarded';

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-green-100 text-green-700',
};

function getGreeting(name) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${greeting}, ${name}`;
}

export default function Today() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openQuickCapture } = useUI();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem(ONBOARDING_KEY));

  function handleOnboardingComplete() {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  }

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

      {/* FAB */}
      <button
        onClick={() => openQuickCapture(() => api.getTasks().then(setTasks).catch(() => { }))}
        className="fixed bottom-20 right-5 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-primary-700 active:scale-95 transition-transform z-20"
        aria-label="Add task"
      >
        +
      </button>
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
    </div>
  );
}

function TaskRow({ task, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-2 text-left group"
    >
      <span className={`shrink-0 w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' :
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
