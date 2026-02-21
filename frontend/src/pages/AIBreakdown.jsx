import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function AIBreakdown() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [creationMode, setCreationMode] = useState('task_only');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    let createdTask = null;
    try {
      createdTask = await api.createTask({
        title: title.trim(),
        description: description.trim(),
        status,
      });

      if (creationMode === 'task_only') {
        setSuccess('Task created successfully.');
      } else {
        const subtasks = await api.generateBreakdown(createdTask.id);
        setSuccess(`Task and ${subtasks.length} subtasks created successfully.`);
      }

      setTitle('');
      setDescription('');
      setStatus('pending');
      setCreationMode('task_only');
    } catch (err) {
      if (creationMode === 'task_with_ai' && createdTask?.id) {
        try {
          await api.deleteTask(createdTask.id);
        } catch (cleanupError) {
          console.error('Failed to rollback task creation after AI breakdown error:', cleanupError);
        }
      }
      setError(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="mb-2 text-3xl font-bold">AI Task Breakdown</h1>
        <p className="mb-6 text-gray-600">
          Create a task with a status, then choose whether to create only the task or create task + AI subtasks.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="mb-1 block text-sm font-medium text-gray-700">
              Task Name
            </label>
            <input
              id="task-title"
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Plan product launch"
              maxLength={500}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="task-description" className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="task-description"
              className="input min-h-[110px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context for better planning..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="task-status" className="mb-1 block text-sm font-medium text-gray-700">
                Task Status
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input"
                disabled={isSubmitting}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="create-mode" className="mb-1 block text-sm font-medium text-gray-700">
                Create Option
              </label>
              <select
                id="create-mode"
                value={creationMode}
                onChange={(e) => setCreationMode(e.target.value)}
                className="input"
                disabled={isSubmitting}
              >
                <option value="task_only">Only create task</option>
                <option value="task_with_ai">Create AI breakdown</option>
              </select>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">
              {creationMode === 'task_only'
                ? 'Creates just the main task.'
                : 'Creates the task and automatically generates subtasks.'}
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
              {success}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting
                ? creationMode === 'task_only'
                  ? 'Creating task...'
                  : 'Creating task + breakdown...'
                : creationMode === 'task_only'
                  ? 'Create Task'
                  : 'Create Task + AI Breakdown'}
            </button>
            <button
              type="button"
              className="rounded-md border border-gray-200 px-4 py-2 hover:bg-gray-50"
              onClick={() => navigate('/tasks')}
              disabled={isSubmitting}
            >
              View Tasks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
