import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as api from '../services/api';

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-green-100 text-green-700',
};
const PRIORITY_LABELS = { high: 'High', medium: 'Medium', low: 'Low' };

function formatDueDate(due_date) {
  if (!due_date) return null;
  const [year, month, day] = due_date.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    isOverdue: date < today,
  };
}

function KanbanCard({ task, onTaskSelect, isOverlay }) {
  const due = formatDueDate(task.due_date);
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-3 ${
        isOverlay ? 'shadow-xl rotate-1 opacity-95' : 'hover:shadow-sm'
      } cursor-pointer select-none`}
      onClick={() => !isOverlay && onTaskSelect && onTaskSelect(task)}
    >
      <div className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">{task.title}</div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {task.priority && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
        )}
        {due && (
          <span
            className={`text-xs font-medium ${
              due.isOverdue && task.status !== 'completed'
                ? 'text-red-600'
                : 'text-gray-400'
            }`}
          >
            {due.isOverdue && task.status !== 'completed' ? '⚠ ' : ''}{due.text}
          </span>
        )}
      </div>
    </div>
  );
}

function SortableCard({ task, onTaskSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard task={task} onTaskSelect={onTaskSelect} />
    </div>
  );
}

function KanbanColumn({ columnId, title, tasks, onTaskSelect, isOver }) {
  const { setNodeRef } = useDroppable({ id: columnId });

  const columnStyles = {
    pending: {
      header: 'text-gray-700 border-gray-200',
      bg: isOver ? 'bg-gray-100' : 'bg-gray-50',
      dot: 'bg-gray-400',
    },
    in_progress: {
      header: 'text-yellow-700 border-yellow-200',
      bg: isOver ? 'bg-yellow-100' : 'bg-yellow-100',
      dot: 'bg-yellow-500',
    },
    completed: {
      header: 'text-green-700 border-green-200',
      bg: isOver ? 'bg-green-100' : 'bg-green-50',
      dot: 'bg-green-500',
    },
  };

  const style = columnStyles[columnId];

  return (
    <div className={`flex flex-col rounded-xl border ${style.header} min-h-[28rem] transition-colors`}>
      <div className={`px-4 py-3 border-b ${style.header} rounded-t-xl ${style.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${style.dot}`} />
            <span className="font-semibold text-sm">{title}</span>
          </div>
          <span className="text-xs font-medium bg-white/70 px-2 py-0.5 rounded-full border border-current/20">
            {tasks.length}
          </span>
        </div>
      </div>

      <div ref={setNodeRef} className={`flex-1 p-3 space-y-2 rounded-b-xl ${style.bg} transition-colors`}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableCard key={task.id} task={task} onTaskSelect={onTaskSelect} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ tasks, onTaskSelect, onTasksChanged }) {
  const [localTasks, setLocalTasks] = useState(tasks);
  const [activeId, setActiveId] = useState(null);
  const [overColumnId, setOverColumnId] = useState(null);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const COLUMN_IDS = ['pending', 'in_progress', 'completed'];

  function getTaskContainer(taskId) {
    return localTasks.find((t) => t.id === taskId)?.status ?? null;
  }

  function findContainer(id) {
    // id could be a column id or a task id
    if (COLUMN_IDS.includes(id)) return id;
    return getTaskContainer(id);
  }

  const activeTask = localTasks.find((t) => t.id === activeId) ?? null;

  const columns = {
    pending: localTasks.filter((t) => t.status === 'pending'),
    in_progress: localTasks.filter((t) => t.status === 'in_progress'),
    completed: localTasks.filter((t) => t.status === 'completed'),
  };

  const columnTitles = { pending: 'To Do', in_progress: 'In Progress', completed: 'Done' };

  function handleDragStart({ active }) {
    setActiveId(active.id);
  }

  function handleDragOver({ active, over }) {
    if (!over) return;
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      setOverColumnId(overContainer);
      return;
    }
    setOverColumnId(overContainer);
    // Optimistically move the card to the new column
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === active.id ? { ...t, status: overContainer } : t))
    );
  }

  function handleDragEnd({ active }) {
    setActiveId(null);
    setOverColumnId(null);

    const currentTask = localTasks.find((t) => t.id === active.id);
    const originalTask = tasks.find((t) => t.id === active.id);
    if (!currentTask || !originalTask) return;

    if (currentTask.status !== originalTask.status) {
      api
        .updateTask(active.id, { status: currentTask.status })
        .then(() => onTasksChanged?.())
        .catch(() => {
          // Revert on error
          setLocalTasks(tasks);
        });
    }
  }

  function handleDragCancel() {
    setActiveId(null);
    setOverColumnId(null);
    setLocalTasks(tasks);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMN_IDS.map((columnId) => (
          <KanbanColumn
            key={columnId}
            columnId={columnId}
            title={columnTitles[columnId]}
            tasks={columns[columnId]}
            onTaskSelect={onTaskSelect}
            isOver={overColumnId === columnId}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150 }}>
        {activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
