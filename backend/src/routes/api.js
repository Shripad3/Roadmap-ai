/**
 * API Routes
 * 
 * Defines all HTTP endpoints and maps them to controller functions.
 * This is where the REST API structure is defined.
 */
import rateLimit from 'express-rate-limit';
import express from 'express';
import * as taskController from '../controllers/taskController.js';

const router = express.Router();

const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests, please try again later.' })
  }
})

/**
 * POST /api/ai/breakdown
 * Generate AI-powered subtasks from plain task text
 * Body: { title: string, description?: string }
 */
router.post('/ai/breakdown', aiRateLimiter, taskController.generateBreakdownFromText);

/**
 * POST /api/ai/estimate-task
 * Estimate time for a task (used when no manual estimate is provided)
 * Body: { title: string, description?: string }
 */
router.post('/ai/estimate-task', aiRateLimiter, taskController.estimateTaskTime);

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
