/**
 * API service
 *
 * Tasks/subtasks are stored in Supabase (RLS protected).
 * AI text generation still goes through backend API.
 */

import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('You\'ve hit the AI request limit. Please wait 15 minutes before trying again.');
    }
    throw new Error(data.error || `HTTP error ${response.status}`);
  }
  return data;
}

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }
  if (!user) {
    throw new Error('You must be signed in.');
  }
  return user;
}

export async function deleteAccount(){
  const {error} = await supabase.rpc('delete_user');
  if(error) throw error;
  await supabase.auth.signOut();
}

export async function getTasks() {
  await requireUser();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTask(taskId) {
  await requireUser();

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (taskError) throw taskError;

  const { data: subtasks, error: subtasksError } = await supabase
    .from('subtasks')
    .select('*')
    .eq('task_id', taskId)
    .order('order_index', { ascending: true });

  if (subtasksError) throw subtasksError;

  return { ...task, subtasks: subtasks || [] };
}

export async function createTask(taskData) {
  const user = await requireUser();
  const { title, description, status, priority, due_date, estimated_hours } = taskData;

  const insertPayload = {
    user_id: user.id,
    title: title?.trim(),
    description: description?.trim() || null,
  };

  if (status) insertPayload.status = status;
  if (priority) insertPayload.priority = priority;
  if (due_date) insertPayload.due_date = due_date;
  if (estimated_hours) insertPayload.estimated_hours = estimated_hours;

  const { data, error } = await supabase
    .from('tasks')
    .insert(insertPayload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(taskId, updates) {
  await requireUser();
  const payload = { ...updates };
  if (payload.title !== undefined) payload.title = payload.title?.trim();
  if (payload.description !== undefined) payload.description = payload.description?.trim() || null;

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(taskId) {
  await requireUser();
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
  return null;
}

// --- AI Usage Tracking (Freemium) ---

export const FREE_PLAN_AI_LIMIT = 10;

export async function getAIUsageThisMonth() {
  const user = await requireUser();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('ai_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString());

  if (error) return 0; // fail open — don't block users if table not created yet
  return count || 0;
}

async function logAIUsage() {
  const user = await requireUser();
  const { error } = await supabase
    .from('ai_usage_logs')
    .insert({ user_id: user.id });
  if (error) console.warn('Failed to log AI usage:', error.message);
}

export async function fetchAIBreakdown(taskId) {
  // Freemium gate: check monthly AI usage
  const usage = await getAIUsageThisMonth();
  if (usage >= FREE_PLAN_AI_LIMIT) {
    throw new Error(
      `You've used all ${FREE_PLAN_AI_LIMIT} free AI generations this month. Upgrade to Pro for unlimited generations.`
    );
  }

  const task = await getTask(taskId);
  const aiSubtasks = await fetchAPI('/ai/breakdown', {
    method: 'POST',
    body: JSON.stringify({
      title: task.title,
      description: task.description || '',
    }),
  });

  if (!Array.isArray(aiSubtasks) || aiSubtasks.length === 0) {
    return [];
  }

  await logAIUsage();
  return aiSubtasks;
}

export async function saveSubtasks(taskId, subtasks) {
  if (!subtasks || subtasks.length === 0) return [];

  const { data: maxOrderRows, error: maxOrderError } = await supabase
    .from('subtasks')
    .select('order_index')
    .eq('task_id', taskId)
    .order('order_index', { ascending: false })
    .limit(1);

  if (maxOrderError) throw maxOrderError;

  const startOrder = (maxOrderRows?.[0]?.order_index ?? -1) + 1;

  const rowsToInsert = subtasks.map((subtask, index) => ({
    task_id: taskId,
    title: subtask.title,
    description: subtask.description || null,
    estimated_hours: subtask.estimated_hours ?? null,
    order_index: startOrder + index,
  }));

  const { data, error } = await supabase
    .from('subtasks')
    .insert(rowsToInsert)
    .select('*')
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function generateBreakdown(taskId) {
  const aiSubtasks = await fetchAIBreakdown(taskId);
  return saveSubtasks(taskId, aiSubtasks);
}

export async function updateSubtask(subtaskId, updates) {
  await requireUser();
  const payload = { ...updates };
  if (payload.title !== undefined) payload.title = payload.title?.trim();
  if (payload.description !== undefined) payload.description = payload.description?.trim() || null;

  const { data, error } = await supabase
    .from('subtasks')
    .update(payload)
    .eq('id', subtaskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSubtask(subtaskId) {
  await requireUser();
  const { error } = await supabase.from('subtasks').delete().eq('id', subtaskId);
  if (error) throw error;
  return null;
}

export async function reorderSubtasks(taskId, subtaskIds) {
  await requireUser();

  // Phase 1: shift all to a large temp index to avoid UNIQUE constraint conflicts
  for (const [index, subtaskId] of subtaskIds.entries()) {
    const { error } = await supabase
      .from('subtasks')
      .update({ order_index: 100000 + index })
      .eq('id', subtaskId)
      .eq('task_id', taskId);
    if (error) throw error;
  }

  // Phase 2: set to correct final values
  const updated = [];
  for (const [index, subtaskId] of subtaskIds.entries()) {
    const { data, error } = await supabase
      .from('subtasks')
      .update({ order_index: index })
      .eq('id', subtaskId)
      .eq('task_id', taskId)
      .select()
      .single();
    if (error) throw error;
    if (data) updated.push(data);
  }

  return updated;
}

export async function reorderTasks(taskIds) {
  await requireUser();

  const updated = [];
  for (const [index, taskId] of taskIds.entries()) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ order_index: index })
      .eq('id', taskId)
      .select()
      .single();
    if (error) throw error;
    if (data) updated.push(data);
  }

  return updated;
}

export async function setTaskPublic(taskId, isPublic) {
  return updateTask(taskId, { is_public: isPublic });
}

export async function estimateTaskHours(title, description) {
  const data = await fetchAPI('/ai/estimate-task', {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  });
  return data?.estimated_hours ?? null;
}

export async function parseTaskNaturalLanguage(text) {
  return fetchAPI('/ai/parse-task', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export default {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  fetchAIBreakdown,
  saveSubtasks,
  generateBreakdown,
  updateSubtask,
  deleteSubtask,
  reorderSubtasks,
  reorderTasks,
  getAIUsageThisMonth,
  setTaskPublic,
  estimateTaskHours,
  parseTaskNaturalLanguage,
  FREE_PLAN_AI_LIMIT,
};
