import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm font-medium text-gray-700 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function ProgressBar({ value, color }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [aiUsage, setAiUsage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [allTasks, usage] = await Promise.all([
          api.getTasks(),
          api.getAIUsageThisMonth(),
        ]);
        setTasks(allTasks);
        setAiUsage(usage);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = tasks.filter(
    (t) => t.due_date && new Date(...t.due_date.split('-').map(Number).map((n, i) => i === 1 ? n - 1 : n)) < today && t.status !== 'completed'
  ).length;

  const highPriority = tasks.filter((t) => t.priority === 'high').length;
  const mediumPriority = tasks.filter((t) => t.priority === 'medium').length;
  const lowPriority = tasks.filter((t) => t.priority === 'low').length;

  const aiUsagePercent = Math.round((aiUsage / api.FREE_PLAN_AI_LIMIT) * 100);

  // Upcoming tasks: not completed, have due date, sorted by due date
  const upcoming = tasks
    .filter((t) => t.due_date && t.status !== 'completed')
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="card text-center py-16">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No data yet</h2>
        <p className="text-gray-500 mb-4">Create some tasks to see your progress here.</p>
        <Link to="/tasks" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Go to Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">Your progress at a glance.</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={total} color="text-gray-900" />
        <StatCard label="Completed" value={completed} sub={`${completionRate}% done`} color="text-green-600" />
        <StatCard label="In Progress" value={inProgress} color="text-blue-600" />
        <StatCard label="Overdue" value={overdue} sub={overdue > 0 ? 'needs attention' : 'all on track'} color={overdue > 0 ? 'text-red-600' : 'text-gray-900'} />
      </div>

      {/* Overall progress */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Overall Completion</h2>
          <span className="text-2xl font-bold text-primary-600">{completionRate}%</span>
        </div>
        <ProgressBar value={completionRate} color="bg-primary-600" />
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" /> {pending} pending</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> {inProgress} in progress</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> {completed} done</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Priority breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Tasks by Priority</h2>
          <div className="space-y-3">
            {[
              { label: 'High', count: highPriority, color: 'bg-red-500', textColor: 'text-red-700' },
              { label: 'Medium', count: mediumPriority, color: 'bg-amber-400', textColor: 'text-amber-700' },
              { label: 'Low', count: lowPriority, color: 'bg-green-500', textColor: 'text-green-700' },
            ].map(({ label, count, color, textColor }) => (
              <div key={label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className={`font-medium ${textColor}`}>{label}</span>
                  <span className="text-gray-600">{count} task{count !== 1 ? 's' : ''}</span>
                </div>
                <ProgressBar value={total > 0 ? (count / total) * 100 : 0} color={color} />
              </div>
            ))}
            {highPriority + mediumPriority + lowPriority < total && (
              <p className="text-xs text-gray-400 mt-2">{total - highPriority - mediumPriority - lowPriority} task{total - highPriority - mediumPriority - lowPriority !== 1 ? 's' : ''} without priority set</p>
            )}
          </div>
        </div>

        {/* AI usage */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-1">AI Generations This Month</h2>
          <p className="text-xs text-gray-500 mb-4">Free plan: {api.FREE_PLAN_AI_LIMIT} per month</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-bold text-primary-600">{aiUsage}</span>
            <span className="text-gray-400 text-sm mb-1">/ {api.FREE_PLAN_AI_LIMIT}</span>
          </div>
          <ProgressBar
            value={aiUsagePercent}
            color={aiUsagePercent >= 90 ? 'bg-red-500' : aiUsagePercent >= 60 ? 'bg-amber-400' : 'bg-primary-600'}
          />
          {aiUsage >= api.FREE_PLAN_AI_LIMIT ? (
            <p className="text-xs text-red-600 mt-2 font-medium">Limit reached — upgrade to Pro for unlimited generations.</p>
          ) : (
            <p className="text-xs text-gray-500 mt-2">{api.FREE_PLAN_AI_LIMIT - aiUsage} generation{api.FREE_PLAN_AI_LIMIT - aiUsage !== 1 ? 's' : ''} remaining</p>
          )}
        </div>
      </div>

      {/* Upcoming tasks */}
      {upcoming.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Upcoming Deadlines</h2>
          <div className="space-y-2">
            {upcoming.map((task) => {
              const [y, m, d] = task.due_date.split('-').map(Number);
              const dueDate = new Date(y, m - 1, d);
              const isOverdue = dueDate < today;
              return (
                <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {task.priority && (
                      <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority[0].toUpperCase() + task.priority.slice(1)}
                      </span>
                    )}
                    <span className="text-sm text-gray-900 truncate">{task.title}</span>
                  </div>
                  <span className={`shrink-0 text-xs font-medium ml-3 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                    {isOverdue ? '⚠ ' : ''}{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
