/**
 * AI Service - Google Gemini (FREE)
 * 
 * Uses Google's Gemini API which has a generous free tier.
 * Get your free API key at: https://aistudio.google.com/app/apikey
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;
let model;

function initializeGemini() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
}

/**
 * Generate subtasks from a main task using Claude
 * 
 * @param {string} taskTitle - The main task to break down
 * @param {string} taskDescription - Optional additional context
 * @returns {Promise<Array>} Array of subtask objects
 */
export async function generateSubtasks(taskTitle, taskDescription = '') {
  try {
    if (!model) {
      initializeGemini();
    }

    const prompt = `You are a task breakdown expert. Break down the following task into 4-8 clear, actionable subtasks.

Main Task: ${taskTitle}
${taskDescription ? `Additional Context: ${taskDescription}` : ''}

Requirements:
- Each subtask should be specific and actionable
- Order them logically (what should be done first, second, etc.)
- Keep subtasks focused and not too broad
- Include a brief description for each subtask explaining why it's important

Respond with ONLY a JSON array of objects with this structure (no markdown, no other text):
[
  {
    "title": "Subtask title (max 100 characters)",
    "description": "Why this subtask is important and what it accomplishes"
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Parse the JSON response
    // Gemini sometimes wraps JSON in markdown, so handle that
    let subtasks;
    try {
      subtasks = JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        subtasks = JSON.parse(jsonMatch[1]);
      } else {
        // Try finding any JSON array in the response
        const arrayMatch = responseText.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          subtasks = JSON.parse(arrayMatch[0]);
        } else {
          throw new Error('Failed to parse AI response as JSON');
        }
      }
    }

    // Validate the response structure
    if (!Array.isArray(subtasks)) {
      throw new Error('AI response is not an array');
    }

    // Validate each subtask has required fields
    subtasks.forEach((subtask, index) => {
      if (!subtask.title || typeof subtask.title !== 'string') {
        throw new Error(`Subtask ${index} missing valid title`);
      }
      if (!subtask.description || typeof subtask.description !== 'string') {
        throw new Error(`Subtask ${index} missing valid description`);
      }
      
      // Trim whitespace
      subtask.title = subtask.title.trim();
      subtask.description = subtask.description.trim();
      
      // Enforce length limits
      if (subtask.title.length > 500) {
        subtask.title = subtask.title.substring(0, 500);
      }
    });

    // Ensure we have at least one subtask
    if (subtasks.length === 0) {
      throw new Error('AI returned no subtasks');
    }

    console.log(`Generated ${subtasks.length} subtasks for: ${taskTitle}`);
    return subtasks;

  } catch (error) {
    // Log the error for debugging
    console.error('AI service error:', {
      message: error.message,
      taskTitle,
      type: error.constructor.name
    });

    // Handle specific API errors
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Gemini API key. Please check your .env file.');
    } else if (error.message?.includes('RATE_LIMIT')) {
      throw new Error('Rate limit exceeded. Free tier allows 15 requests/minute.');
    } else if (error.message?.includes('quota')) {
      throw new Error('Daily quota exceeded. Free tier allows 1,500 requests/day.');
    }

    // Re-throw the error to be handled by the controller
    throw error;
  }
}

/**
 * Validate API key on startup
 */
export async function validateApiKey() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  try {
    initializeGemini();
    const result = await model.generateContent('Hi');
    await result.response;
    
    console.log('✅ Gemini API key validated successfully');
    console.log('🆓 Using FREE Gemini API (15 req/min, 1500 req/day)');
  } catch (error) {
    console.error('❌ Gemini API key validation failed:', error.message);
    throw new Error('Invalid or inactive Gemini API key');
  }
}

export default { generateSubtasks, validateApiKey };
