import { supabase } from '../lib/supabase';

export async function getPublicTask(taskId) {
  const { data: task, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .eq('is_public', true)
    .single();

  if (error) throw error;

  const { data: subtasks, error: subError } = await supabase
    .from('subtasks')
    .select('*')
    .eq('task_id', taskId)
    .order('order_index', { ascending: true });

  if (subError) throw subError;

  return { ...task, subtasks: subtasks || [] };
}
