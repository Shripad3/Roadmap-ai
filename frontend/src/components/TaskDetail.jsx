/**
 * TaskDetail Component
 * 
 * Displays a task with all its subtasks.
 * Allows generating AI breakdown, editing subtasks, and managing task status.
 */

import { useState, useEffect } from 'react';
import SubtaskItem from './SubtaskItem';
import * as api from '../services/api';

export default function TaskDetail({ task, onTaskUpdated, onBack, onTaskDeleted }) {
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  // --- Edit Modal state ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Update subtasks when task prop changes
  useEffect(() => {
    setSubtasks(task.subtasks || []);
  }, [task]);

  function openEditModal(task) {
      setEditingTaskId(task.id);
      setEditTitle(task.title || "");
      setEditDescription(task.description || "");
      setIsEditOpen(true);
    }
  
    function closeEditModal() {
      setIsEditOpen(false);
      setEditingTaskId(null);
      setEditTitle("");
      setEditDescription("");
      setSavingEdit(false);
    }
  
    // Close modal on Escape
    useEffect(() => {
      if (!isEditOpen) return;
      const onKeyDown = (e) => {
        if (e.key === "Escape") closeEditModal();
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [isEditOpen]);
  
    async function saveEdit() {
      const title = editTitle.trim();
      const description = editDescription.trim();
      if (!editingTaskId) return;
  
      if (!title) {
        alert("Title cannot be empty.");
        return;
      }
  
      try {
        setSavingEdit(true);
        await api.updateTask(editingTaskId, {
          title,
          description: description || null,
        });
        closeEditModal();
        onTaskUpdated(); // refresh list
      } catch (error) {
        console.error("Failed to update task:", error);
        alert("Failed to update task. Please try again.");
        setSavingEdit(false);
      }
    }

  async function handleGenerateBreakdown() {
    if (!confirm('This will generate AI subtasks. Any existing subtasks will remain. Continue?')) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const newSubtasks = await api.generateBreakdown(task.id);
      setSubtasks([...subtasks, ...newSubtasks]);
      onTaskUpdated(); // Refresh parent
    } catch (err) {
      setError(err.message || 'Failed to generate breakdown');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSubtaskUpdate(subtaskId, updates) {
    try {
      const updated = await api.updateSubtask(subtaskId, updates);
      setSubtasks(subtasks.map(st => st.id === subtaskId ? updated : st));
    } catch (err) {
      setError(err.message || 'Failed to update subtask');
    }
  }

  async function handleSubtaskDelete(subtaskId) {
    if (!confirm('Delete this subtask?')) {
      return;
    }

    try {
      await api.deleteSubtask(subtaskId);
      setSubtasks(subtasks.filter(st => st.id !== subtaskId));
    } catch (err) {
      setError(err.message || 'Failed to delete subtask');
    }
  }

  async function handleTaskStatusChange(newStatus) {
    try {
      await api.updateTask(task.id, { status: newStatus });
      onTaskUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update task status');
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to tasks
          </button>
          {/* Edit */}
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(task);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                openEditModal(task);
              }
            }}
            className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer select-none"
            title="Edit task"
          >
            Edit
          </span>


        </div>


        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
          {task.description && (
            <p className="text-gray-600">{task.description}</p>
          )}
        </div>

        {/* Task Status */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Status
          </label>
          <div className="flex flex-wrap gap-2">
            {['pending', 'in_progress', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => handleTaskStatusChange(status)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                  ${task.status === status
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

        {/* Generate Breakdown Button */}
        <button
          onClick={handleGenerateBreakdown}
          disabled={isGenerating}
          className="btn btn-primary w-full"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating AI Breakdown...
            </span>
          ) : (
            'Generate AI Breakdown'
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-800 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Subtasks List */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">
          Subtasks ({subtasks.length})
        </h2>

        {subtasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg mb-2">No subtasks yet</p>
            <p className="text-sm">Click "Generate AI Breakdown" to create subtasks automatically</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subtasks.map((subtask) => (
              <SubtaskItem
                key={subtask.id}
                subtask={subtask}
                onUpdate={handleSubtaskUpdate}
                onDelete={handleSubtaskDelete}
              />
            ))}
          </div>
        )}
      </div>
      {/* Edit Modal */}
      {isEditOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={closeEditModal}
            aria-label="Close modal"
          />
          <div className="relative bg-white w-full max-w-lg mx-4 rounded-xl shadow-lg border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
                <p className="text-sm text-gray-600">Update the title and description.</p>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 rounded-md hover:bg-gray-50 text-gray-600"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={savingEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Task title"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={savingEdit}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add more details..."
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={closeEditModal}
                disabled={savingEdit}
                className="px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={savingEdit}
                className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
              >
                {savingEdit ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
