/**
 * API Routes
 * 
 * Defines all HTTP endpoints and maps them to controller functions.
 * This is where the REST API structure is defined.
 */

import express from 'express';
import * as taskController from '../controllers/taskController.js';

const router = express.Router();

/**
 * POST /api/ai/breakdown
 * Generate AI-powered subtasks from plain task text
 * Body: { title: string, description?: string }
 */
router.post('/ai/breakdown', taskController.generateBreakdownFromText);

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
