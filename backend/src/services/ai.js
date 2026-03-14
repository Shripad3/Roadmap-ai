/**
 * AI Service - Google Gemini (FREE)
 *
 * Uses Google's Gemini API which has a generous free tier.
 * Get your free API key at: https://aistudio.google.com/app/apikey
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
//import Anthropic from "@anthropic-ai/sdk";

let genAI;
let model;

function initializeGemini() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  //const anthropic = new Anthropic();
}

/**
 * Generate subtasks from a main task using Claude
 *
 * @param {string} taskTitle - The main task to break down
 * @param {string} taskDescription - Optional additional context
 * @returns {Promise<Array>} Array of subtask objects
 */
export async function generateSubtasks(taskTitle, taskDescription = "") {
  try {
    if (!model) {
      initializeGemini();
    }

    const prompt = `You are an expert task planner.

Break the following task into a realistic, well-ordered set of subtasks (aim for 3 to 7; use fewer if the task is simple).

Main Task: ${taskTitle}
${taskDescription ? `Additional Context: ${taskDescription}` : ""}

A good subtask:
- is specific and actionable
- represents a meaningful block of work
- is neither too broad nor too trivial
- can usually be completed in 0.25 to 3 hours
- has a clear purpose

Rules:
- Order subtasks logically by execution sequence.
- Use strong action verbs.
- Avoid vague, repetitive, or overlapping subtasks.
- If the task is ambiguous, include a clarification or research step early.
- If the task is large, break it into sensible phases.
- Descriptions must explain the outcome and importance of the subtask, not just repeat the title.

Bad subtasks include:
- "Work on the task"
- "Do implementation"
- "Handle setup"
- "Write the code" (too broad for a software task)
- duplicated or overly broad steps
- tiny checklist items with no standalone value

Time estimation rules:
- estimated_hours must be a decimal number in hours
- use realistic values like 0.25, 0.5, 1, 1.5, 2, 3, 4, 6, or 8
- for complex or technical subtasks, values above 3 are appropriate
- do not assign identical estimates to everything unless justified

Return ONLY valid JSON in this exact format:
[
  {
    "title": "Subtask title",
    "description": "What this subtask accomplishes and why it matters",
    "estimated_hours": 1.5
  }
]

Validation requirements:
- title max 100 characters
- concise, useful description
- valid JSON only
- no markdown
- no explanation outside the JSON
`;

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
      const jsonMatch = responseText.match(
        /```(?:json)?\s*(\[[\s\S]*?\])\s*```/,
      );
      if (jsonMatch) {
        subtasks = JSON.parse(jsonMatch[1]);
      } else {
        // Try finding any JSON array in the response
        const arrayMatch = responseText.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          subtasks = JSON.parse(arrayMatch[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }
    }

    // Validate the response structure
    if (!Array.isArray(subtasks)) {
      throw new Error("AI response is not an array");
    }

    // Validate each subtask has required fields
    subtasks.forEach((subtask, index) => {
      if (!subtask.title || typeof subtask.title !== "string") {
        throw new Error(`Subtask ${index} missing valid title`);
      }
      if (!subtask.description || typeof subtask.description !== "string") {
        throw new Error(`Subtask ${index} missing valid description`);
      }

      // Trim whitespace
      subtask.title = subtask.title.trim();
      subtask.description = subtask.description.trim();

      // Enforce length limits
      if (subtask.title.length > 500) {
        subtask.title = subtask.title.substring(0, 500);
      }

      // Normalize estimated_hours: must be a positive number or null
      if (
        subtask.estimated_hours !== undefined &&
        subtask.estimated_hours !== null
      ) {
        const h = parseFloat(subtask.estimated_hours);
        subtask.estimated_hours =
          !isNaN(h) && h > 0 ? Math.round(h * 4) / 4 : null; // round to nearest 0.25
      } else {
        subtask.estimated_hours = null;
      }
    });

    // Ensure we have at least one subtask
    if (subtasks.length === 0) {
      throw new Error("AI returned no subtasks");
    }

    console.log(`Generated ${subtasks.length} subtasks for: ${taskTitle}`);
    return subtasks;
  } catch (error) {
    // Log the error for debugging
    console.error("AI service error:", {
      message: error.message,
      taskTitle,
      type: error.constructor.name,
    });

    // Handle specific API errors
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("Invalid Gemini API key. Please check your .env file.");
    } else if (error.message?.includes("RATE_LIMIT")) {
      throw new Error(
        "Rate limit exceeded. Free tier allows 15 requests/minute.",
      );
    } else if (error.message?.includes("quota")) {
      throw new Error(
        "Daily quota exceeded. Free tier allows 1,500 requests/day.",
      );
    }

    // Re-throw the error to be handled by the controller
    throw error;
  }
}

/**
 * Estimate how long a task will take in hours.
 *
 * @param {string} taskTitle
 * @param {string} taskDescription
 * @returns {Promise<number>} Estimated hours, rounded to nearest 0.25
 */
export async function estimateTaskHours(taskTitle, taskDescription = "") {
  try {
    if (!model) {
      initializeGemini();
    }

    const prompt = `You are a time estimation expert. Estimate how long it would take a competent person to complete the following task.

Task: ${taskTitle}
${taskDescription ? `Context: ${taskDescription}` : ""}

Respond with ONLY a single decimal number representing hours (e.g. 0.5, 2, 4.5). No text, no units, just the number.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    const h = parseFloat(text);
    if (isNaN(h) || h <= 0) throw new Error("Invalid estimate from AI");

    // Round to nearest 0.25, clamp to 0.25–40
    return Math.min(40, Math.max(0.25, Math.round(h * 4) / 4));
  } catch (error) {
    console.error("AI estimate error:", error.message);
    throw error;
  }
}

/**
 * Validate API key on startup
 */
export async function validateApiKey() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  try {
    initializeGemini();
    const result = await model.generateContent("Hi");
    await result.response;

    console.log("✅ Gemini API key validated successfully");
    console.log("🆓 Using FREE Gemini API (15 req/min, 1500 req/day)");
  } catch (error) {
    console.error("❌ Gemini API key validation failed:", error.message);
    throw new Error("Invalid or inactive Gemini API key");
  }
}

export default { generateSubtasks, estimateTaskHours, validateApiKey };
