/**
 * Task Model
 * 
 * Handles all database operations for tasks and subtasks.
 * Each method corresponds to a specific database operation.
 */

import { query } from '../services/database.js';

/**
 * Create a new task
 * @param {string} title - Task title
 * @param {string} description - Task description (optional)
 * @returns {Promise<Object>} Created task
 */
export async function createTask(title, description = null) {
  const result = await query(
    `INSERT INTO tasks (title, description) 
     VALUES ($1, $2) 
     RETURNING *`,
    [title, description]
  );
  
  return result.rows[0];
}

/**
 * Get all tasks (without subtasks)
 * Ordered by most recent first
 * @returns {Promise<Array>} Array of tasks
 */
export async function getAllTasks() {
  const result = await query(
    `SELECT * FROM tasks 
     ORDER BY created_at DESC`
  );
  
  return result.rows;
}

/**
 * Get a single task with all its subtasks
 * @param {string} taskId - UUID of the task
 * @returns {Promise<Object|null>} Task object with subtasks array, or null if not found
 */
export async function getTaskById(taskId) {
  // Get the task
  const taskResult = await query(
    `SELECT * FROM tasks WHERE id = $1`,
    [taskId]
  );
  
  if (taskResult.rows.length === 0) {
    return null;
  }
  
  const task = taskResult.rows[0];
  
  // Get all subtasks for this task, ordered by order_index
  const subtasksResult = await query(
    `SELECT * FROM subtasks 
     WHERE task_id = $1 
     ORDER BY order_index ASC`,
    [taskId]
  );
  
  // Combine task and subtasks
  task.subtasks = subtasksResult.rows;
  
  return task;
}

/**
 * Update a task
 * @param {string} taskId - UUID of the task
 * @param {Object} updates - Fields to update (title, description, status)
 * @returns {Promise<Object|null>} Updated task or null if not found
 */
export async function updateTask(taskId, updates) {
  // Build dynamic SQL based on which fields are being updated
  const fields = [];
  const values = [];
  let paramCounter = 1;
  
  if (updates.title !== undefined) {
    fields.push(`title = $${paramCounter++}`);
    values.push(updates.title);
  }
  
  if (updates.description !== undefined) {
    fields.push(`description = $${paramCounter++}`);
    values.push(updates.description);
  }
  
  if (updates.status !== undefined) {
    fields.push(`status = $${paramCounter++}`);
    values.push(updates.status);
  }
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  // Add task ID as final parameter
  values.push(taskId);
  
  const result = await query(
    `UPDATE tasks 
     SET ${fields.join(', ')} 
     WHERE id = $${paramCounter} 
     RETURNING *`,
    values
  );
  
  return result.rows[0] || null;
}

/**
 * Delete a task and all its subtasks
 * @param {string} taskId - UUID of the task
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteTask(taskId) {
  // ON DELETE CASCADE will automatically delete related subtasks
  const result = await query(
    `DELETE FROM tasks WHERE id = $1 RETURNING id`,
    [taskId]
  );
  
  return result.rows.length > 0;
}

/**
 * Create multiple subtasks for a task
 * @param {string} taskId - UUID of the parent task
 * @param {Array} subtasks - Array of {title, description} objects
 * @returns {Promise<Array>} Created subtasks
 */
export async function createSubtasks(taskId, subtasks) {
  // First, verify the task exists
  const taskExists = await query(
    `SELECT id FROM tasks WHERE id = $1`,
    [taskId]
  );
  
  if (taskExists.rows.length === 0) {
    throw new Error('Task not found');
  }
  
  // Get the current max order_index for this task
  const maxOrderResult = await query(
    `SELECT COALESCE(MAX(order_index), -1) as max_order FROM subtasks WHERE task_id = $1`,
    [taskId]
  );
  
  let nextOrder = maxOrderResult.rows[0].max_order + 1;
  
  // Insert all subtasks
  // We'll use a single query with multiple rows for better performance
  const values = [];
  const placeholders = [];
  
  subtasks.forEach((subtask, index) => {
    const offset = index * 4;
    placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`);
    values.push(taskId, subtask.title, subtask.description || null, nextOrder++);
  });
  
  const result = await query(
    `INSERT INTO subtasks (task_id, title, description, order_index) 
     VALUES ${placeholders.join(', ')} 
     RETURNING *`,
    values
  );
  
  return result.rows;
}

/**
 * Update a single subtask
 * @param {string} subtaskId - UUID of the subtask
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated subtask or null if not found
 */
export async function updateSubtask(subtaskId, updates) {
  const fields = [];
  const values = [];
  let paramCounter = 1;
  
  if (updates.title !== undefined) {
    fields.push(`title = $${paramCounter++}`);
    values.push(updates.title);
  }
  
  if (updates.description !== undefined) {
    fields.push(`description = $${paramCounter++}`);
    values.push(updates.description);
  }
  
  if (updates.status !== undefined) {
    fields.push(`status = $${paramCounter++}`);
    values.push(updates.status);
  }
  
  if (updates.order_index !== undefined) {
    fields.push(`order_index = $${paramCounter++}`);
    values.push(updates.order_index);
  }
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  values.push(subtaskId);
  
  const result = await query(
    `UPDATE subtasks 
     SET ${fields.join(', ')} 
     WHERE id = $${paramCounter} 
     RETURNING *`,
    values
  );
  
  return result.rows[0] || null;
}

/**
 * Delete a single subtask
 * @param {string} subtaskId - UUID of the subtask
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteSubtask(subtaskId) {
  const result = await query(
    `DELETE FROM subtasks WHERE id = $1 RETURNING id`,
    [subtaskId]
  );
  
  return result.rows.length > 0;
}

/**
 * Reorder subtasks for a task
 * @param {string} taskId - UUID of the task
 * @param {Array<string>} subtaskIds - Ordered array of subtask IDs
 * @returns {Promise<Array>} Updated subtasks
 */
export async function reorderSubtasks(taskId, subtaskIds) {
  // Update each subtask's order_index based on its position in the array
  const updatePromises = subtaskIds.map((subtaskId, index) => 
    query(
      `UPDATE subtasks 
       SET order_index = $1 
       WHERE id = $2 AND task_id = $3 
       RETURNING *`,
      [index, subtaskId, taskId]
    )
  );
  
  const results = await Promise.all(updatePromises);
  return results.map(r => r.rows[0]).filter(Boolean);
}

export default {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  createSubtasks,
  updateSubtask,
  deleteSubtask,
  reorderSubtasks
};
