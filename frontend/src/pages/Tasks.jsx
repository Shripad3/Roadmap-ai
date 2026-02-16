import { useState, useEffect } from 'react';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import TaskDetail from '../components/TaskDetail';
import * as api from '../services/api';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const EXAMPLE_TASKS = [
    {
      title: "Learn React fundamentals",
      description: "Cover components, props/state, hooks, and routing. Build a small todo app."
    },
    {
      title: "Build a portfolio website",
      description: "Create 3 sections (About, Projects, Contact) and deploy on Vercel/Netlify."
    },
    {
      title: "Prepare for interviews (DSA + system design)",
      description: "Solve 2 problems/day, revise patterns weekly, and do 1 mock interview per week."
    },
    {
      title: "Ship a full-stack mini app",
      description: "CRUD app with auth + Postgres. Add one AI feature and write a README."
    }
  ];


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
      console.error('Error loading tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTaskCreated(taskData) {
    const newTask = await api.createTask(taskData);
    setTasks([newTask, ...tasks]);
    return newTask;
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

  function handleTaskDeleted() {
    loadTasks();
  }

  async function handleTaskUpdated() {
    if (selectedTask) {
      const updated = await api.getTask(selectedTask.id);
      setSelectedTask(updated);
    }
    loadTasks();
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Try an example task</h2>
        <p className="text-sm text-gray-600 mt-1">
          Click one to create it instantly (you can edit it later).
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {EXAMPLE_TASKS.map((t) => (
            <button
              key={t.title}
              onClick={async () => {
                await handleTaskCreated({ title: t.title, description: t.description });
              }}
              className="text-left p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
            >
              <div className="font-medium text-gray-900">{t.title}</div>
              <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                {t.description}
              </div>
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
          <button
            onClick={() => setError(null)}
            className="text-red-800 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      {selectedTask ? (
        <TaskDetail
          task={selectedTask}
          onTaskUpdated={handleTaskUpdated}
          onBack={handleBackToList}
          onTaskDeleted={handleTaskDeleted}
        />
      ) : (
        <div className="space-y-8">
          <div>
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold mb-4">Your Tasks</h2>
            <button
              onClick={async () => {
                const newTask = await handleTaskCreated({ title: 'New Task', description: '' });
                handleTaskSelect(newTask);
              }}
              className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Task
            </button>
            </div>
            
            <TaskList
              tasks={tasks}
              onTaskSelect={handleTaskSelect}
              onTaskDeleted={handleTaskDeleted}
            />
          </div>
        </div>
      )}
    </div>
  );
}