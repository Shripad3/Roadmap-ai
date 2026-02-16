/**
 * API Routes
 * 
 * Defines all HTTP endpoints and maps them to controller functions.
 * This is where the REST API structure is defined.
 */

import express from 'express';
import * as taskController from '../controllers/taskController.js';

const router = express.Router();

// ============================================================================
// TASK ROUTES
// ============================================================================

/**
 * POST /api/tasks
 * Create a new task
 * Body: { title: string, description?: string }
 */
router.post('/tasks', taskController.createTask);

/**
 * GET /api/tasks
 * Get all tasks (without subtasks)
 */
router.get('/tasks', taskController.getAllTasks);

/**
 * GET /api/tasks/:id
 * Get a single task with all its subtasks
 */
router.get('/tasks/:id', taskController.getTaskById);

/**
 * PUT /api/tasks/:id
 * Update a task
 * Body: { title?: string, description?: string, status?: string }
 */
router.put('/tasks/:id', taskController.updateTask);

/**
 * DELETE /api/tasks/:id
 * Delete a task and all its subtasks
 */
router.delete('/tasks/:id', taskController.deleteTask);

/**
 * POST /api/tasks/:id/breakdown
 * Generate AI-powered subtasks for a task
 * This calls the Claude API to break down the task
 */
router.post('/tasks/:id/breakdown', taskController.generateBreakdown);

/**
 * PUT /api/tasks/:id/reorder
 * Reorder subtasks
 * Body: { subtaskIds: string[] }
 */
router.put('/tasks/:id/reorder', taskController.reorderSubtasks);

// ============================================================================
// SUBTASK ROUTES
// ============================================================================

/**
 * PUT /api/subtasks/:id
 * Update a subtask
 * Body: { title?: string, description?: string, status?: string }
 */
router.put('/subtasks/:id', taskController.updateSubtask);

/**
 * DELETE /api/subtasks/:id
 * Delete a single subtask
 */
router.delete('/subtasks/:id', taskController.deleteSubtask);

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * GET /api/health
 * Simple health check endpoint for monitoring
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'task-breakdown-api'
  });
});

export default router;
