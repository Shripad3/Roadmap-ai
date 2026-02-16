/**
 * Task Controller
 * 
 * Handles HTTP request/response logic for task-related endpoints.
 * Validates input, calls model methods, and formats responses.
 */

import * as Task from '../models/Task.js';
import * as AI from '../services/ai.js';

/**
 * Create a new task
 * POST /api/tasks
 */
export async function createTask(req, res) {
  try {
    const { title, description } = req.body;
    
    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Title is required and must be a non-empty string' 
      });
    }
    
    if (title.length > 500) {
      return res.status(400).json({ 
        error: 'Title must be less than 500 characters' 
      });
    }
    
    // Create task in database
    const task = await Task.createTask(title.trim(), description?.trim());
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
}

/**
 * Get all tasks
 * GET /api/tasks
 */
export async function getAllTasks(req, res) {
  try {
    const tasks = await Task.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

/**
 * Get a single task with its subtasks
 * GET /api/tasks/:id
 */
export async function getTaskById(req, res) {
  try {
    const { id } = req.params;
    
    const task = await Task.getTaskById(id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
}

/**
 * Update a task
 * PUT /api/tasks/:id
 */
export async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    
    const updates = {};
    
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Title must be a non-empty string' 
        });
      }
      if (title.length > 500) {
        return res.status(400).json({ 
          error: 'Title must be less than 500 characters' 
        });
      }
      updates.title = title.trim();
    }
    
    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }
    
    if (status !== undefined) {
      const validStatuses = ['pending', 'in_progress', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: `Status must be one of: ${validStatuses.join(', ')}` 
        });
      }
      updates.status = status;
    }
    
    const task = await Task.updateTask(id, updates);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
}

/**
 * Delete a task
 * DELETE /api/tasks/:id
 */
export async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    
    const deleted = await Task.deleteTask(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
}

/**
 * Generate AI subtasks for a task
 * POST /api/tasks/:id/breakdown
 */
export async function generateBreakdown(req, res) {
  try {
    const { id } = req.params;
    
    // First, verify the task exists and get its details
    const task = await Task.getTaskById(id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Call AI service to generate subtasks
    let aiSubtasks;
    try {
      aiSubtasks = await AI.generateSubtasks(task.title, task.description);
    } catch (aiError) {
      // Handle AI-specific errors with user-friendly messages
      return res.status(503).json({ 
        error: aiError.message || 'Failed to generate subtasks using AI'
      });
    }
    
    // Save subtasks to database
    const createdSubtasks = await Task.createSubtasks(id, aiSubtasks);
    
    res.status(201).json(createdSubtasks);
  } catch (error) {
    console.error('Error generating breakdown:', error);
    res.status(500).json({ error: 'Failed to generate task breakdown' });
  }
}

/**
 * Update a subtask
 * PUT /api/subtasks/:id
 */
export async function updateSubtask(req, res) {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    
    const updates = {};
    
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Title must be a non-empty string' 
        });
      }
      if (title.length > 500) {
        return res.status(400).json({ 
          error: 'Title must be less than 500 characters' 
        });
      }
      updates.title = title.trim();
    }
    
    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }
    
    if (status !== undefined) {
      const validStatuses = ['pending', 'in_progress', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: `Status must be one of: ${validStatuses.join(', ')}` 
        });
      }
      updates.status = status;
    }
    
    const subtask = await Task.updateSubtask(id, updates);
    
    if (!subtask) {
      return res.status(404).json({ error: 'Subtask not found' });
    }
    
    res.json(subtask);
  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(500).json({ error: 'Failed to update subtask' });
  }
}

/**
 * Delete a subtask
 * DELETE /api/subtasks/:id
 */
export async function deleteSubtask(req, res) {
  try {
    const { id } = req.params;
    
    const deleted = await Task.deleteSubtask(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Subtask not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({ error: 'Failed to delete subtask' });
  }
}

/**
 * Reorder subtasks
 * PUT /api/tasks/:id/reorder
 */
export async function reorderSubtasks(req, res) {
  try {
    const { id } = req.params;
    const { subtaskIds } = req.body;
    
    if (!Array.isArray(subtaskIds)) {
      return res.status(400).json({ 
        error: 'subtaskIds must be an array' 
      });
    }
    
    const subtasks = await Task.reorderSubtasks(id, subtaskIds);
    
    res.json(subtasks);
  } catch (error) {
    console.error('Error reordering subtasks:', error);
    res.status(500).json({ error: 'Failed to reorder subtasks' });
  }
}

export default {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  generateBreakdown,
  updateSubtask,
  deleteSubtask,
  reorderSubtasks
};
