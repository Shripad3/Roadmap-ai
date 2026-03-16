import { useState, useEffect } from 'react';
import TaskList from '../components/TaskList';
import TaskDetail from '../components/TaskDetail';
import KanbanBoard from '../components/KanbanBoard';
import * as api from '../services/api';
import { useUI } from '../contexts/UIContext';

const EXAMPLE_TASKS = [
  { title: "Plan a vacation trip", description: "Choose a destination, book flights and accommodation, and create a day-by-day itinerary." },
  { title: "Start a fitness routine", description: "Set a weekly workout schedule, track progress, and build healthy eating habits." },
  { title: "Declutter and organize your home", description: "Go room by room, donate unused items, and set up a system to stay organized." },
  { title: "Read 12 books this year", description: "Pick one book per month across different genres and set aside 20 minutes daily for reading." },
];

export default function Tasks() {
  const { openQuickCapture } = useUI();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTaskSelect(task) {
    try {
      const fullTask = await api.getTask(task.id);
      setSelectedTask(fullTask);
    } catch (err) {
      setError(err.message || 'Failed to load task details');
    }
  }

  function handleBackToList() {
    setSelectedTask(null);
    loadTasks();
  }

  // Optimistic local update — no API refetch needed
  function handleTaskOptimisticUpdate(taskId, updates) {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, ...updates } : t));
  }

  function handleTasksChanged(newTasks) {
    setTasks(newTasks);
  }

  function handleTaskReorder(reorderedTasks) {
    setTasks(reorderedTasks);
  }

  async function handleTaskUpdated() {
    if (selectedTask) {
      const updated = await api.getTask(selectedTask.id);
      setSelectedTask(updated);
    }
    loadTasks();
  }

  function openCapture() {
    openQuickCapture(() => loadTasks());
  }

  if (isLoading && !selectedTask) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Try an example task</h2>
            <p className="text-sm text-gray-600 mt-1">Click one to create a task instantly (you can edit it later).</p>
          </div>
          <button
            onClick={openCapture}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {EXAMPLE_TASKS.map((t) => (
            <button
              key={t.title}
              onClick={async () => {
                await api.createTask({ title: t.title, description: t.description });
                loadTasks();
              }}
              className="text-left p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
            >
              <div className="font-medium text-gray-900">{t.title}</div>
              <div className="text-sm text-gray-600 mt-1 line-clamp-2">{t.description}</div>
              <div className="text-xs text-primary-600 mt-3">Create this task →</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-800 hover:text-red-900">✕</button>
        </div>
      )}

      {selectedTask ? (
        <TaskDetail
          task={selectedTask}
          onTaskUpdated={handleTaskUpdated}
          onBack={handleBackToList}
          onTaskDeleted={handleBackToList}
        />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Your Tasks</h2>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-sm font-medium transition ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1.5 text-sm font-medium transition ${viewMode === 'kanban' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  Kanban
                </button>
              </div>
              <button
                onClick={openCapture}
                className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden md:inline">New Task</span>
              </button>
            </div>
          </div>

          {viewMode === 'list' ? (
            <TaskList
              tasks={tasks}
              onTaskSelect={handleTaskSelect}
              onTaskDeleted={loadTasks}
              onReorder={handleTaskReorder}
              onTaskOptimisticUpdate={handleTaskOptimisticUpdate}
              onTasksChanged={handleTasksChanged}
            />
          ) : (
            <KanbanBoard
              tasks={tasks}
              onTaskSelect={handleTaskSelect}
              onTasksChanged={loadTasks}
            />
          )}
        </div>
      )}
    </div>
  );
}
