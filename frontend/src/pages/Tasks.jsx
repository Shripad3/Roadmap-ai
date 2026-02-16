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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
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
        />
      ) : (
        <div className="space-y-8">
          <TaskForm onTaskCreated={handleTaskCreated} />

          <div>
            <h2 className="text-2xl font-bold mb-4">Your Tasks</h2>
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