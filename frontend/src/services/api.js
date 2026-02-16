/**
 * API Service
 * 
 * Centralized module for all API calls to the backend.
 * This keeps API logic separate from components and makes it reusable.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses (like 204 No Content)
    if (response.status === 204) {
      return null;
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// ============================================================================
// TASK ENDPOINTS
// ============================================================================

/**
 * Get all tasks
 * @returns {Promise<Array>} Array of tasks
 */
export async function getTasks() {
  return fetchAPI('/tasks');
}

/**
 * Get a single task with subtasks
 * @param {string} taskId - UUID of the task
 * @returns {Promise<Object>} Task object with subtasks
 */
export async function getTask(taskId) {
  return fetchAPI(`/tasks/${taskId}`);
}

/**
 * Create a new task
 * @param {Object} taskData - { title, description }
 * @returns {Promise<Object>} Created task
 */
export async function createTask(taskData) {
  return fetchAPI('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
}

/**
 * Update a task
 * @param {string} taskId - UUID of the task
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated task
 */
export async function updateTask(taskId, updates) {
  return fetchAPI(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * Delete a task
 * @param {string} taskId - UUID of the task
 * @returns {Promise<null>}
 */
export async function deleteTask(taskId) {
  return fetchAPI(`/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

/**
 * Generate AI breakdown for a task
 * @param {string} taskId - UUID of the task
 * @returns {Promise<Array>} Array of generated subtasks
 */
export async function generateBreakdown(taskId) {
  return fetchAPI(`/tasks/${taskId}/breakdown`, {
    method: 'POST',
  });
}

// ============================================================================
// SUBTASK ENDPOINTS
// ============================================================================

/**
 * Update a subtask
 * @param {string} subtaskId - UUID of the subtask
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated subtask
 */
export async function updateSubtask(subtaskId, updates) {
  return fetchAPI(`/subtasks/${subtaskId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * Delete a subtask
 * @param {string} subtaskId - UUID of the subtask
 * @returns {Promise<null>}
 */
export async function deleteSubtask(subtaskId) {
  return fetchAPI(`/subtasks/${subtaskId}`, {
    method: 'DELETE',
  });
}

/**
 * Reorder subtasks
 * @param {string} taskId - UUID of the task
 * @param {Array<string>} subtaskIds - Ordered array of subtask IDs
 * @returns {Promise<Array>} Updated subtasks
 */
export async function reorderSubtasks(taskId, subtaskIds) {
  return fetchAPI(`/tasks/${taskId}/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ subtaskIds }),
  });
}

export default {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  generateBreakdown,
  updateSubtask,
  deleteSubtask,
  reorderSubtasks,
};
