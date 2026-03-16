/**
 * Task Controller
 *
 * Backend is AI-only for task breakdown generation.
 */

import * as AI from '../services/ai.js';

/**
 * Generate AI subtasks from provided task text
 * POST /api/ai/breakdown
 * Body: { title: string, description?: string }
 */
export async function generateBreakdownFromText(req, res) {
  try {
    const { title, description } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Title is required and must be a non-empty string',
      });
    }

    let aiSubtasks;
    try {
      aiSubtasks = await AI.generateSubtasks(title.trim(), description?.trim() || '');
    } catch (aiError) {
      return res.status(503).json({
        error: aiError.message || 'Failed to generate subtasks using AI',
      });
    }

    return res.status(200).json(aiSubtasks);
  } catch (error) {
    console.error('Error generating breakdown from text:', error);
    return res.status(500).json({ error: 'Failed to generate task breakdown' });
  }
}

/**
 * Estimate time for a single task
 * POST /api/ai/estimate-task
 * Body: { title: string, description?: string }
 */
export async function estimateTaskTime(req, res) {
  try {
    const { title, description } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
    }

    let hours;
    try {
      hours = await AI.estimateTaskHours(title.trim(), description?.trim() || '');
    } catch (aiError) {
      return res.status(503).json({ error: aiError.message || 'Failed to estimate time using AI' });
    }

    return res.status(200).json({ estimated_hours: hours });
  } catch (error) {
    console.error('Error estimating task time:', error);
    return res.status(500).json({ error: 'Failed to estimate task time' });
  }
}

/**
 * Parse a natural language task description into structured task fields
 * POST /api/ai/parse-task
 * Body: { text: string }
 */
export async function parseTaskFromNaturalLanguage(req, res) {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'text is required and must be a non-empty string' });
    }
    if (text.trim().length > 500) {
      return res.status(400).json({ error: 'text must be 500 characters or fewer' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    let parsed;
    try {
      parsed = await AI.parseNaturalLanguageTask(text.trim(), todayStr);
    } catch (aiError) {
      return res.status(503).json({ error: aiError.message || 'Failed to parse task using AI' });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Error parsing natural language task:', error);
    return res.status(500).json({ error: 'Failed to parse task' });
  }
}

export default {
  generateBreakdownFromText,
  estimateTaskTime,
  parseTaskFromNaturalLanguage,
};
