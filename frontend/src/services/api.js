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

export async function getTasks() {
  await requireUser();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
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
  const { title, description, status } = taskData;

  const insertPayload = {
    user_id: user.id,
    title: title?.trim(),
    description: description?.trim() || null,
  };

  if (status) {
    insertPayload.status = status;
  }

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

export async function generateBreakdown(taskId) {
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

  const { data: maxOrderRows, error: maxOrderError } = await supabase
    .from('subtasks')
    .select('order_index')
    .eq('task_id', taskId)
    .order('order_index', { ascending: false })
    .limit(1);

  if (maxOrderError) throw maxOrderError;

  const startOrder = (maxOrderRows?.[0]?.order_index ?? -1) + 1;

  const rowsToInsert = aiSubtasks.map((subtask, index) => ({
    task_id: taskId,
    title: subtask.title,
    description: subtask.description || null,
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

export default {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  generateBreakdown,
  updateSubtask,
  deleteSubtask,
  reorderSubtasks,
};
