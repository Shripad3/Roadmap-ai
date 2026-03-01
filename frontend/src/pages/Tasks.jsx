import { useState, useEffect } from 'react';
import TaskList from '../components/TaskList';
import TaskDetail from '../components/TaskDetail';
import * as api from '../services/api';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const EXAMPLE_TASKS = [
  {
    title: "Plan a vacation trip",
    description: "Choose a destination, book flights and accommodation, and create a day-by-day itinerary."
  },
  {
    title: "Start a fitness routine",
    description: "Set a weekly workout schedule, track progress, and build healthy eating habits."
  },
  {
    title: "Declutter and organize your home",
    description: "Go room by room, donate unused items, and set up a system to stay organized."
  },
  {
    title: "Read 12 books this year",
    description: "Pick one book per month across different genres and set aside 20 minutes daily for reading."
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
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }

  function openCreateModal() {
    setError(null);
    setIsCreateOpen(true);
  }

  function closeCreateModal() {
    if (isCreating) return;
    setIsCreateOpen(false);
    setNewTitle('');
    setNewDescription('');
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    if (!newTitle.trim()) {
      setError('Please enter a task title');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      await handleTaskCreated({
        title: newTitle.trim(),
        description: newDescription.trim(),
      });
      closeCreateModal();
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsCreating(false);
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

  function handleTaskDeleted() {
    loadTasks();
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

  const createTaskModal = isCreateOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-black/40"
        onClick={closeCreateModal}
        aria-label="Close create task modal"
      />
      <div className="relative w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
            <p className="text-sm text-gray-600">Add a title and optional description.</p>
          </div>
          <button
            onClick={closeCreateModal}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-50"
            title="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-4 px-5 py-4">
          <div>
            <label htmlFor="new-task-title" className="mb-1 block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="new-task-title"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="input"
              placeholder="e.g., Plan launch checklist"
              maxLength={500}
              disabled={isCreating}
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="new-task-description" className="mb-1 block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              id="new-task-description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="input min-h-[100px]"
              placeholder="Add context to improve AI subtasks..."
              rows={4}
              disabled={isCreating}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={closeCreateModal}
              className="rounded-md border border-gray-200 px-4 py-2 hover:bg-gray-50"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-60"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  if(isLoading){
    return(
      <div className='flex justify-center'>
        Loading tasks...
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className='flex justify-between'>
            <div>
            <h2 className="text-lg font-semibold text-gray-900">Try an example task</h2>
          <p className="text-sm text-gray-600 mt-1">
            Click one to create a task instantly (you can edit it later).
          </p>
          </div>
          
          <button
            onClick={openCreateModal}
            className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Task
          </button>
          </div>
          
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
        {createTaskModal}
      </>
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
                onClick={openCreateModal}
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
              onReorder={handleTaskReorder}
            />
          </div>
        </div>
      )}

      {createTaskModal}
    </div>
  );
}
