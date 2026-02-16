import { useEffect, useMemo, useState } from "react";
import * as api from "../services/api";

export default function TaskList({ tasks, onTaskSelect, onTaskDeleted }) {
  // --- Edit Modal state ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // --- Inline status saving ---
  const [savingStatusId, setSavingStatusId] = useState(null);

  // --- Roadmap / Subtasks state per task ---
  // map: taskId -> { open: boolean, loading: boolean, generating: boolean, subtasks: [] }
  const [roadmaps, setRoadmaps] = useState({});

  const editingTask = useMemo(
    () => tasks.find((t) => t.id === editingTaskId) || null,
    [tasks, editingTaskId]
  );

  function openEditModal(task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title || "");
    setEditDescription(task.description || "");
    setIsEditOpen(true);
  }

  function closeEditModal() {
    setIsEditOpen(false);
    setEditingTaskId(null);
    setEditTitle("");
    setEditDescription("");
    setSavingEdit(false);
  }

  // Close modal on Escape
  useEffect(() => {
    if (!isEditOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeEditModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isEditOpen]);

  async function saveEdit() {
    const title = editTitle.trim();
    const description = editDescription.trim();
    if (!editingTaskId) return;

    if (!title) {
      alert("Title cannot be empty.");
      return;
    }

    try {
      setSavingEdit(true);
      await api.updateTask(editingTaskId, {
        title,
        description: description || null,
      });
      closeEditModal();
      onTaskDeleted(); // refresh list
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to update task. Please try again.");
      setSavingEdit(false);
    }
  }

  async function handleDelete(taskId, taskTitle) {
    if (!confirm(`Delete "${taskTitle}" and all its subtasks?`)) return;

    try {
      await api.deleteTask(taskId);
      // cleanup local roadmap state
      setRoadmaps((prev) => {
        const copy = { ...prev };
        delete copy[taskId];
        return copy;
      });
      onTaskDeleted();
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task. Please try again.");
    }
  }

  async function handleStatusChange(taskId, newStatus) {
    try {
      setSavingStatusId(taskId);
      await api.updateTask(taskId, { status: newStatus });
      onTaskDeleted();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setSavingStatusId(null);
    }
  }

  // ---- Roadmap helpers ----

  function ensureRoadmapEntry(taskId) {
    setRoadmaps((prev) => {
      if (prev[taskId]) return prev;
      return {
        ...prev,
        [taskId]: { open: false, loading: false, generating: false, subtasks: null },
      };
    });
  }

  async function toggleRoadmap(taskId) {
    ensureRoadmapEntry(taskId);

    setRoadmaps((prev) => {
      const current = prev[taskId] || {
        open: false,
        loading: false,
        generating: false,
        subtasks: null,
      };
      return {
        ...prev,
        [taskId]: { ...current, open: !current.open },
      };
    });

    // If opening and we haven't loaded subtasks yet, load them
    const entry = roadmaps[taskId];
    const isOpening = !(entry?.open ?? false); // because we toggled
    const hasSubtasksLoaded = entry?.subtasks !== null && entry?.subtasks !== undefined;

    if (isOpening && !hasSubtasksLoaded) {
      await loadSubtasks(taskId);
    }
  }

  async function loadSubtasks(taskId) {
    setRoadmaps((prev) => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || { open: true, generating: false }),
        open: true,
        loading: true,
        subtasks: prev[taskId]?.subtasks ?? null,
      },
    }));

    try {
      const task = await api.getTask(taskId); // backend returns task + task.subtasks
      setRoadmaps((prev) => ({
        ...prev,
        [taskId]: {
          ...(prev[taskId] || {}),
          open: true,
          loading: false,
          subtasks: Array.isArray(task?.subtasks) ? task.subtasks : [],
        },
      }));
    } catch (err) {
      console.error("Failed to load subtasks:", err);
      setRoadmaps((prev) => ({
        ...prev,
        [taskId]: { ...(prev[taskId] || {}), loading: false },
      }));
      alert("Failed to load roadmap. Please try again.");
    }
  }

  async function generateSubtasks(taskId) {
    ensureRoadmapEntry(taskId);

    setRoadmaps((prev) => ({
      ...prev,
      [taskId]: { ...(prev[taskId] || {}), open: true, generating: true },
    }));

    try {
      await api.generateBreakdown(taskId);
      // Reload subtasks after generation to show the latest list from DB
      await loadSubtasks(taskId);
    } catch (err) {
      console.error("Failed to generate subtasks:", err);
      alert("Failed to generate subtasks. Please try again.");
    } finally {
      setRoadmaps((prev) => ({
        ...prev,
        [taskId]: { ...(prev[taskId] || {}), generating: false },
      }));
    }
  }

  const statusLabels = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
  };

  const statusDot = {
    pending: "bg-gray-400",
    in_progress: "bg-blue-500",
    completed: "bg-green-500",
  };

  const subtaskStatusDot = {
    pending: "bg-gray-300",
    in_progress: "bg-blue-400",
    completed: "bg-green-400",
  };

  if (tasks.length === 0) {
    return (
      <div className="card text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks yet</h3>
        <p className="text-gray-600">Create your first task above to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {tasks.map((task) => {
          const rm = roadmaps[task.id];
          const open = rm?.open ?? false;
          const loading = rm?.loading ?? false;
          const generating = rm?.generating ?? false;
          const subtasks = rm?.subtasks;

          return (
            <div
              key={task.id}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Title (select task) */}
                <button
                  className="text-left flex-1 min-w-0"
                  onClick={() => onTaskSelect(task)}
                  title="Open task"
                >
                  <div className="font-medium text-gray-900 hover:text-primary-600 truncate">
                    {task.title}
                  </div>
                  <div>
                    {/* Roadmap toggle (text, not button) */}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRoadmap(task.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleRoadmap(task.id);
                      }
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer select-none"
                    title={open ? "Hide roadmap" : "View roadmap"}
                  >
                    {open ? "Hide roadmap" : "View roadmap"}
                  </span>
                  </div>
                </button>

                {/* Right controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Status dropdown */}
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${statusDot[task.status]}`} />
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      disabled={savingStatusId === task.id}
                      className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white hover:bg-gray-50 disabled:opacity-60"
                      title="Change status"
                    >
                      <option value="pending">{statusLabels.pending}</option>
                      <option value="in_progress">{statusLabels.in_progress}</option>
                      <option value="completed">{statusLabels.completed}</option>
                    </select>
                  </div>

                  {/* Edit */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(task);
                    }}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-200 hover:bg-gray-50"
                    title="Edit task"
                  >
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(task.id, task.title);
                    }}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-200 text-red-600 hover:bg-red-50"
                    title="Delete task"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Roadmap section */}
              {open ? (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">
                      Roadmap
                    </div>

                    {/* Generate subtasks (text) */}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        generateSubtasks(task.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          generateSubtasks(task.id);
                        }
                      }}
                      className={`text-sm cursor-pointer select-none ${
                        generating
                          ? "text-gray-400"
                          : "text-primary-600 hover:text-primary-700"
                      }`}
                      title="Generate subtasks using AI"
                    >
                      {generating ? "Generating..." : "Generate subtasks"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mt-3">
                    {loading ? (
                      <div className="text-sm text-gray-600">Loading roadmap…</div>
                    ) : Array.isArray(subtasks) && subtasks.length > 0 ? (
                      <ol className="space-y-2">
                        {subtasks.map((st, idx) => (
                          <li key={st.id} className="flex items-start gap-3">
                            {/* index / step */}
                            <div className="mt-0.5 flex items-center gap-2">
                              <span className="text-xs text-gray-500 w-5 text-right">
                                {idx + 1}.
                              </span>
                              <span
                                className={`inline-block w-2 h-2 rounded-full ${
                                  subtaskStatusDot[st.status] || "bg-gray-300"
                                }`}
                              />
                            </div>

                            {/* text */}
                            <div className="min-w-0">
                              <div className="text-sm text-gray-900 font-medium">
                                {st.title}
                              </div>
                              {st.description ? (
                                <div className="text-sm text-gray-600">
                                  {st.description}
                                </div>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <div className="text-sm text-gray-600">
                        No subtasks yet. Click <span className="font-medium">Generate subtasks</span> to create a roadmap.
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {isEditOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={closeEditModal}
            aria-label="Close modal"
          />
          <div className="relative bg-white w-full max-w-lg mx-4 rounded-xl shadow-lg border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
                <p className="text-sm text-gray-600">Update the title and description.</p>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 rounded-md hover:bg-gray-50 text-gray-600"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={savingEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Task title"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={savingEdit}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add more details..."
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={closeEditModal}
                disabled={savingEdit}
                className="px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={savingEdit}
                className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
              >
                {savingEdit ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
