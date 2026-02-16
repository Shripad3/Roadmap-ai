/**
 * SubtaskItem Component
 * 
 * Displays a single subtask with edit/delete capabilities.
 * Shows status with color-coded indicators.
 */

import { useState } from 'react';

export default function SubtaskItem({ subtask, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subtask.title);
  const [editDescription, setEditDescription] = useState(subtask.description || '');

  async function handleSave() {
    try {
      await onUpdate(subtask.id, {
        title: editTitle,
        description: editDescription || null,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update subtask:', error);
    }
  }

  async function handleStatusChange(newStatus) {
    try {
      await onUpdate(subtask.id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  function handleCancel() {
    setEditTitle(subtask.title);
    setEditDescription(subtask.description || '');
    setIsEditing(false);
  }

  // Status color mapping
  const statusColors = {
    pending: 'bg-gray-100 text-gray-700 border-gray-300',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-300',
    completed: 'bg-green-100 text-green-700 border-green-300',
  };

  const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
  };

  if (isEditing) {
    // Edit mode
    return (
      <div className="border border-gray-300 rounded-lg p-4 bg-yellow-50">
        <div className="space-y-3">
          <input
            type="text"
            className="input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Subtask title"
          />
          <textarea
            className="input min-h-[80px]"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="btn btn-primary flex-1"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View mode
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 mb-1">{subtask.title}</h4>
          {subtask.description && (
            <p className="text-sm text-gray-600 mb-2">{subtask.description}</p>
          )}
          
          {/* Status Selector */}
          <div className="flex flex-wrap gap-2">
            {['pending', 'in_progress', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium border transition-colors
                  ${subtask.status === status 
                    ? statusColors[status] 
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-600 hover:text-blue-600 p-1 rounded"
            title="Edit subtask"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(subtask.id)}
            className="text-gray-600 hover:text-red-600 p-1 rounded"
            title="Delete subtask"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
