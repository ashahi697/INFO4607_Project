import { useEffect, useMemo, useState, type ReactNode } from "react";
import AddTaskModal from "../app-shell/AddTaskModal";
import TaskCompletionModal from "../app-shell/TaskCompletionModal";
import { userID } from "../../App";
import { APP_EVENT_TASK_CREATED } from "../../lib/app-events";

type Task = {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  due: string;
  completed: boolean;
  completedDate?: string;
  createdAt?: string;
};

type WeekRange = {
  start: string;
  end: string;
};

const normalizePriority = (task: any): "High" | "Medium" | "Low" => {
  const rawPriority = task?.priority;
  if (rawPriority === "High" || rawPriority === "Medium" || rawPriority === "Low") {
    return rawPriority;
  }

  const weight = Number(task?.priority_weight ?? task?.priorityWeight);
  if (!Number.isNaN(weight)) {
    if (weight >= 5) return "High";
    if (weight >= 3) return "Medium";
  }

  return "Low";
};

const formatTaskDate = (rawDate: string | undefined): string => {
  if (!rawDate) return "";

  const datePartMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (datePartMatch) {
    const year = Number(datePartMatch[1]);
    const month = Number(datePartMatch[2]);
    const day = Number(datePartMatch[3]);
    const parsedLocal = new Date(year, month - 1, day);
    if (!Number.isNaN(parsedLocal.getTime())) {
      return parsedLocal.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate;

  return parsed.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateAsInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeInputDate = (rawDate?: string): string => {
  if (!rawDate) return "";

  const directMatch = rawDate.match(/^\d{4}-\d{2}-\d{2}/);
  if (directMatch) return directMatch[0];

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return "";

  return formatDateAsInput(parsed);
};

const getTodayInputDate = (): string => formatDateAsInput(new Date());

const getCurrentWeekRange = (): WeekRange => {
  const today = new Date();
  const day = today.getDay(); // Sun=0, Mon=1, ..., Sat=6
  const diffToMonday = day === 0 ? 6 : day - 1;

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - diffToMonday);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    start: formatDateAsInput(weekStart),
    end: formatDateAsInput(weekEnd),
  };
};

const getTaskTimestamp = (task: Task): number => {
  const sourceDate = task.createdAt || task.due;
  const parsed = sourceDate ? new Date(sourceDate).getTime() : NaN;
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
};

const getCompletionTimestamp = (task: Task): number => {
  const normalizedCompleted = normalizeInputDate(task.completedDate);
  if (!normalizedCompleted) return Number.MIN_SAFE_INTEGER;
  return new Date(`${normalizedCompleted}T00:00:00`).getTime();
};

const getPriorityRank = (priority: Task["priority"]): number => {
  if (priority === "High") return 0;
  if (priority === "Medium") return 1;
  return 2;
};

const isDateWithinRange = (rawDate: string, range: WeekRange): boolean => {
  const normalized = normalizeInputDate(rawDate);
  if (!normalized) return false;
  return normalized >= range.start && normalized <= range.end;
};

function PanelHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b px-5 py-3">
      <h3 className="font-medium">{title}</h3>
      {right}
    </div>
  );
}

function ProductivityHeatmapCard({
  heatmapImageUrl,
  isLoading,
  error,
  range,
}: {
  heatmapImageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  range: WeekRange;
}) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <PanelHeader
        title="Productivity Heatmap"
        right={<div className="text-sm text-gray-500">{range.start} to {range.end}</div>}
      />
      <div className="p-5">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-sm text-gray-500">
            Generating heatmap...
          </div>
        ) : error ? (
          <div className="h-64 flex items-center justify-center text-sm text-red-600">
            {error}
          </div>
        ) : heatmapImageUrl ? (
          <img
            src={heatmapImageUrl}
            alt="Productivity heatmap"
            className="w-full h-auto max-h-[55vh] object-contain rounded-lg border border-gray-200 mx-auto"
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-sm text-gray-500">
            No heatmap available.
          </div>
        )}
      </div>
    </div>
  );
}

function TasksCard({
  title,
  tasks,
  emptyMessage,
  dateLabel,
  onTaskToggle,
  onTaskDelete,
}: {
  title: string;
  tasks: Task[];
  emptyMessage: string;
  dateLabel: "Created" | "Date Completed";
  onTaskToggle: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
}) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <PanelHeader title={title} />
      <div className="max-h-80 overflow-y-auto">
        {tasks.map((task) => (
          <div key={task.id} className="flex h-16 items-start gap-3 border-b border-gray-100 px-5 py-3 last:border-b-0">
            <input
              id={`productivity-task-${task.id}`}
              type="checkbox"
              checked={!!task.completed}
              onChange={() => onTaskToggle(task)}
              className="mt-1"
            />
            <div className="flex-1">
              <label
                htmlFor={`productivity-task-${task.id}`}
                className={`block truncate font-medium cursor-pointer ${task.completed ? "line-through text-gray-400" : ""}`}
              >
                {task.title}
              </label>
              <div className="text-sm text-gray-500">
                <span className="inline-block px-2 py-0.5 rounded bg-gray-100 mr-2">{task.priority} Priority</span>
                {dateLabel === "Date Completed" ? (
                  <span>Date Completed: {formatTaskDate(task.completedDate) || "No completion date"}</span>
                ) : (
                  <span>Created: {task.due || "No created date"}</span>
                )}
              </div>
            </div>
            {onTaskDelete ? (
              <button
                type="button"
                onClick={() => onTaskDelete(task)}
                className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-50"
              >
                Delete
              </button>
            ) : null}
          </div>
        ))}
        {tasks.length === 0 ? <div className="p-5 text-sm text-gray-500">{emptyMessage}</div> : null}
      </div>
    </div>
  );
}

export default function ProductivityPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [heatmapImageUrl, setHeatmapImageUrl] = useState<string | null>(null);
  const [heatmapLoading, setHeatmapLoading] = useState(true);
  const [heatmapError, setHeatmapError] = useState<string | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskCompletionDate, setTaskCompletionDate] = useState(getTodayInputDate());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTaskActionLoading, setIsTaskActionLoading] = useState(false);
  const displayedWeekRange = useMemo(() => getCurrentWeekRange(), []);

  const openTaskCompletionModal = (task: Task) => {
    setSelectedTask(task);
    setTaskCompletionDate(normalizeInputDate(task.completedDate) || getTodayInputDate());
    setIsTaskModalOpen(true);
  };

  const closeTaskCompletionModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
    setTaskCompletionDate(getTodayInputDate());
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/get_tasks?userID=${userID}`);
      const data = await res.json();

      const normalizedTasks: Task[] = Array.isArray(data?.tasks)
        ? data.tasks.map((task: any) => ({
            id: String(task.task_id ?? task.id ?? `${task.task_name ?? task.title}-${task.created_at ?? task.due_date ?? ""}`),
            title: task.title ?? task.task_name ?? task.name ?? "Untitled Task",
            priority: normalizePriority(task),
            due: formatTaskDate(task.due_date ?? task.due ?? task.created_at ?? ""),
            completed: Boolean(task.completed || task.completed_date),
            completedDate: task.completed_date ?? "",
            createdAt: task.created_at ?? task.due_date ?? task.due ?? "",
          }))
        : [];

      setTasks(normalizedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchHeatmap = async () => {
    try {
      setHeatmapLoading(true);
      setHeatmapError(null);

      const res = await fetch(
        `/api/productivity_heatmap?userID=${userID}&start_date=${displayedWeekRange.start}&end_date=${displayedWeekRange.end}`
      );
      if (!res.ok) {
        throw new Error("Failed to generate heatmap");
      }

      const data = await res.json();
      const imagePath = data?.heatmap?.image_path as string | undefined;
      const imageName = imagePath?.split(/[\\/]/).pop() ?? "heatmap.png";
      setHeatmapImageUrl(`/api/generated/${imageName}?t=${Date.now()}`);
    } catch (error) {
      console.error("Error fetching heatmap:", error);
      setHeatmapError("Could not load productivity heatmap.");
      setHeatmapImageUrl(null);
    } finally {
      setHeatmapLoading(false);
    }
  };

  const maybeReloadHeatmapForWeek = async (dates: string[]) => {
    const impactsDisplayedWeek = dates.some((date) => isDateWithinRange(date, displayedWeekRange));
    if (impactsDisplayedWeek) {
      await fetchHeatmap();
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;

    const previousCompletionDate = selectedTask.completedDate ?? "";
    const nextCompletionDate = taskCompletionDate;

    try {
      setIsTaskActionLoading(true);
      const response = await fetch(
        `/api/complete_task?userID=${userID}&task_id=${selectedTask.id}&completed_date=${encodeURIComponent(nextCompletionDate)}`,
        { method: "PUT" }
      );
      if (!response.ok) {
        throw new Error("Failed to complete task");
      }

      closeTaskCompletionModal();
      await fetchTasks();
      await maybeReloadHeatmapForWeek([previousCompletionDate, nextCompletionDate]);
    } catch (error) {
      console.error("Error completing task:", error);
    } finally {
      setIsTaskActionLoading(false);
    }
  };

  const handleIncompleteTask = async () => {
    if (!selectedTask) return;

    const previousCompletionDate = selectedTask.completedDate ?? "";

    try {
      setIsTaskActionLoading(true);
      const response = await fetch(`/api/incomplete_task?userID=${userID}&task_id=${selectedTask.id}`, {
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error("Failed to mark task incomplete");
      }

      closeTaskCompletionModal();
      await fetchTasks();
      await maybeReloadHeatmapForWeek([previousCompletionDate]);
    } catch (error) {
      console.error("Error marking task incomplete:", error);
    } finally {
      setIsTaskActionLoading(false);
    }
  };

  const handleTaskAdded = (newTask: any) => {
    setTasks((prev) => [
      {
        id: String(newTask.id ?? newTask.task_id ?? Date.now()),
        title: newTask.title ?? "Untitled Task",
        priority: normalizePriority(newTask),
        due: formatTaskDate(newTask.due ?? newTask.due_date ?? ""),
        completed: false,
        completedDate: "",
        createdAt: newTask.createdAt ?? newTask.created_at ?? "",
      },
      ...prev,
    ]);
    fetchTasks();
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      const response = await fetch(`/api/delete_task?userID=${userID}&task_id=${encodeURIComponent(task.id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      await fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const incompleteTasks = useMemo(
    () =>
      tasks
        .filter((task) => !task.completed)
        .sort((a, b) => {
          const priorityDiff = getPriorityRank(a.priority) - getPriorityRank(b.priority);
          if (priorityDiff !== 0) return priorityDiff;
          return getTaskTimestamp(a) - getTaskTimestamp(b);
        }),
    [tasks]
  );

  const completedTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.completed)
        .sort((a, b) => {
          const completedDiff = getCompletionTimestamp(b) - getCompletionTimestamp(a);
          if (completedDiff !== 0) return completedDiff;
          return getTaskTimestamp(b) - getTaskTimestamp(a);
        }),
    [tasks]
  );

  useEffect(() => {
    fetchTasks();
    fetchHeatmap();
  }, []);

  useEffect(() => {
    const handleTaskCreated = () => {
      fetchTasks();
    };

    window.addEventListener(APP_EVENT_TASK_CREATED, handleTaskCreated);
    return () => {
      window.removeEventListener(APP_EVENT_TASK_CREATED, handleTaskCreated);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Productivity</h1>
          <p className="text-gray-500">
            View task progress, work patterns, and focus habits.
          </p>
        </div>

        <button
          onClick={() => setIsAddTaskModalOpen(true)}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
        >
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ProductivityHeatmapCard
            heatmapImageUrl={heatmapImageUrl}
            isLoading={heatmapLoading}
            error={heatmapError}
            range={displayedWeekRange}
          />
        </div>
        <div className="space-y-4">
          <TasksCard
            title="Incomplete Tasks"
            tasks={incompleteTasks}
            emptyMessage="No incomplete tasks."
            dateLabel="Created"
            onTaskToggle={openTaskCompletionModal}
            onTaskDelete={handleDeleteTask}
          />
          <TasksCard
            title="Completed Tasks"
            tasks={completedTasks}
            emptyMessage="No completed tasks."
            dateLabel="Date Completed"
            onTaskToggle={openTaskCompletionModal}
          />
        </div>
      </div>

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        userID={userID}
        onTaskAdded={handleTaskAdded}
      />

      <TaskCompletionModal
        isOpen={isTaskModalOpen}
        selectedTask={selectedTask}
        taskCompletionDate={taskCompletionDate}
        isTaskActionLoading={isTaskActionLoading}
        onTaskCompletionDateChange={setTaskCompletionDate}
        onClose={closeTaskCompletionModal}
        onMarkComplete={handleCompleteTask}
        onMarkIncomplete={handleIncompleteTask}
      />
    </div>
  );
}
