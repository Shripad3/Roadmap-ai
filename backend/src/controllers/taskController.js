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

export default {
  generateBreakdownFromText,
};
