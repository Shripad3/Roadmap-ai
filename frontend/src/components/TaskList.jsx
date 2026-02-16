/**
 * TaskList Component
 * 
 * Displays all tasks in a grid.
 * Allows selecting a task to view details or deleting tasks.
 */

import * as api from '../services/api';

export default function TaskList({ tasks, onTaskSelect, onTaskDeleted }) {
  async function handleDelete(taskId, taskTitle) {
    if (!confirm(`Delete "${taskTitle}" and all its subtasks?`)) {
      return;
    }

    try {
      await api.deleteTask(taskId);
      onTaskDeleted();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  }

  const statusColors = {
    pending: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };

  const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
  };

  if (tasks.length === 0) {
    return (
      <div className="card text-center py-12">
        <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks yet</h3>
        <p className="text-gray-600">Create your first task above to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="card hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => onTaskSelect(task)}
        >
          {/* Task Header */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <div className="mb-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
              {statusLabels[task.status]}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              {new Date(task.created_at).toLocaleDateString()}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                handleDelete(task.id, task.title);
              }}
              className="text-gray-400 hover:text-red-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete task"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
