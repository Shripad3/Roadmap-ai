/**
 * TaskForm Component
 * 
 * Form for creating new tasks.
 * Uses controlled inputs (React manages the input state).
 */

import { useState } from 'react';

export default function TaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Call the parent's callback with the new task data
      await onTaskCreated({ title, description });
      
      // Clear form on success
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Task Title *
          </label>
          <input
            id="title"
            type="text"
            className="input"
            placeholder="e.g., Launch new product, Plan wedding, Learn React"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            maxLength={500}
            required
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            className="input min-h-[100px]"
            placeholder="Add any additional context that will help the AI understand your task better..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            More context helps the AI generate better subtasks
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
}
