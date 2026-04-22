import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AddTransactionModal from "../app-shell/AddTransactionModal";
import TaskCompletionModal from "../app-shell/TaskCompletionModal";
import {
  APP_EVENT_SCHEDULE_CREATED,
  APP_EVENT_TASK_CREATED,
  APP_EVENT_TRANSACTION_CREATED,
} from "../../lib/app-events";
import { userID } from "../../App";
import { fetchUserName } from "../../lib/user-name";

type Stat = { label: string; value: string; delta?: string };

type ScheduleItem = {
  title: string;
  start_time?: string;
  end_time?: string;
  date?: string;
  sortTimestamp?: number;
};

type Transaction = {
  title: string;
  date: string;
  amount: string;
  id: string;
  amountValue: number;
  positive: boolean;
};

type Task = {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  due: string;
  completed?: boolean;
  completedDate?: string;
  createdAt?: string;
};

const MAX_DASHBOARD_TASKS = 5;

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

const getTaskTimestamp = (task: Task): number => {
  const sourceDate = task.createdAt || task.due;
  const parsed = sourceDate ? new Date(sourceDate).getTime() : NaN;
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
};

const getPriorityRank = (priority: Task["priority"]): number => {
  if (priority === "High") return 0;
  if (priority === "Medium") return 1;
  return 2;
};

const parseTransactionAmount = (rawAmount: string): number => {
  const parsed = Number(rawAmount.replace(/[^0-9.-]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getTodayInputDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateAsInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateOnlyLocal = (rawDate: string): Date | null => {
  const dateMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!dateMatch) return null;
  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  return new Date(year, month - 1, day);
};

const getScheduleStartDateTime = (rawDate?: string | null, rawTime?: string | null): Date | null => {
  if (!rawDate) return null;
  const baseDate = parseDateOnlyLocal(rawDate);
  if (!baseDate) return null;

  const timeMatch = rawTime?.match(/^(\d{2}):(\d{2})/);
  if (!timeMatch) {
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, 0, 0, 0);
  }

  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hour, minute, 0, 0);
};

const formatScheduleDate = (rawDate?: string | null): string => {
  if (!rawDate) return "";
  const parsedLocal = parseDateOnlyLocal(rawDate);
  if (!parsedLocal || Number.isNaN(parsedLocal.getTime())) return rawDate;
  return parsedLocal.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isInCurrentMonth = (rawDate: string): boolean => {
  if (!rawDate) return false;
  const parsedDate = new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) return false;

  const now = new Date();
  return parsedDate.getMonth() === now.getMonth() && parsedDate.getFullYear() === now.getFullYear();
};

function StatCard({ label, value, delta }: Stat) {
  const styles = {
    "Total Balance": "from-blue-500 to-blue-600",
    "Income (This Month)": "from-green-500 to-green-600",
    "Expenses (This Month)": "from-orange-500 to-orange-600",
    "Tasks Completed": "from-purple-500 to-purple-600",
  };

  const icons = {
    "Total Balance": "💲",
    "Income (This Month)": "📈",
    "Expenses (This Month)": "📉",
    "Tasks Completed": "📝",
  };

  const gradient = styles[label as keyof typeof styles] || "from-gray-500 to-gray-600";
  const icon = icons[label as keyof typeof icons] || "•";

  return (
    <div className={`rounded-2xl bg-gradient-to-r ${gradient} p-5 text-white shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg">{icon}</div>
        {delta ? <div className="text-sm font-medium text-white/90">{delta}</div> : null}
      </div>

      <div className="mt-6 text-sm text-white/80">{label}</div>
      <div className="mt-1 text-4xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function ProductivityHeatmapCard({
  heatmapImageUrl,
  isLoading,
  error,
}: {
  heatmapImageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h3 className="text-base font-semibold text-gray-900">Productivity Heatmap</h3>
        <div className="flex items-center gap-2 text-sm">
          <button className="rounded-md px-3 py-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">Week</button>
          <button className="rounded-md bg-gray-100 px-3 py-1 font-medium text-gray-700">Month</button>
          <button className="rounded-md px-3 py-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">Year</button>
        </div>
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-sm text-gray-500">Generating heatmap...</div>
        ) : error ? (
          <div className="h-64 flex items-center justify-center text-sm text-red-600">{error}</div>
        ) : heatmapImageUrl ? (
          <img
            src={heatmapImageUrl}
            alt="Productivity heatmap"
            className="w-full h-auto max-h-[55vh] object-contain rounded-lg border border-gray-200 mx-auto"
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-sm text-gray-500">No heatmap available.</div>
        )}
      </div>
    </div>
  );
}

function UpcomingScheduleCard({ schedule }: { schedule: ScheduleItem[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h3 className="text-base font-semibold text-gray-900">Upcoming Schedule</h3>
        <Link to="/calendar" className="text-sm font-medium text-gray-400 transition hover:text-gray-600">
          View All
        </Link>
      </div>

      <div className="space-y-3 p-4">
        {schedule.length > 0 ? (
          <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
            {schedule.slice(0, 4).map((item, index) => (
              <div key={`${item.title}-${index}`} className="flex gap-3 rounded-xl border border-gray-100 p-3">
                <div className="mt-1 h-10 w-1 rounded-full bg-gray-300" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  <div className="text-xs text-gray-500">
                    {item.end_time ? `${item.start_time} - ${item.end_time}` : item.start_time}
                  </div>
                  {item.date ? <div className="mt-1 text-xs text-gray-400">{item.date}</div> : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No upcoming events.</div>
        )}
      </div>
    </div>
  );
}

function RecentTransactionsCard({
  transactions,
  onAddTransactionClick,
}: {
  transactions: Transaction[];
  onAddTransactionClick: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAddTransactionClick}
            aria-label="Add transaction"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 pb-px text-base font-semibold leading-none text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
          >
            +
          </button>

          <Link to="/financial" className="text-sm font-medium text-gray-400 transition hover:text-gray-600">
            View All
          </Link>
        </div>
      </div>

      <div className="space-y-1 p-3">
        {transactions.slice(0, 5).map((t) => (
          <div key={`${t.id}-${t.date}`} className="flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-sm">
                {t.amount.startsWith("+") ? "💼" : "🛒"}
              </div>

              <div>
                <div className="text-sm font-medium text-gray-900">{t.title}</div>
                <div className="text-xs text-gray-500">{t.date}</div>
              </div>
            </div>

            <div className={`text-sm font-semibold ${t.amount.startsWith("+") ? "text-green-600" : "text-gray-700"}`}>{t.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TasksCard({
  tasks,
  onTaskToggle,
}: {
  tasks: Task[];
  onTaskToggle: (task: Task) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h3 className="text-base font-semibold text-gray-900">Active Tasks</h3>
        <Link to="/productivity" className="text-sm font-medium text-gray-400 transition hover:text-gray-600">
          View All
        </Link>
      </div>

      <div className="space-y-1 p-3">
        {tasks.slice(0, MAX_DASHBOARD_TASKS).map((task) => (
          <div key={task.id} className="flex items-start justify-between rounded-xl px-3 py-3 transition hover:bg-gray-50">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={!!task.completed}
                onChange={() => onTaskToggle(task)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />

              <div>
                <div className={`text-sm font-medium ${task.completed ? "text-gray-400 line-through" : "text-gray-900"}`}>{task.title}</div>

                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <span
                    className={`rounded-md px-2 py-1 font-medium ${
                      task.priority === "High"
                        ? "bg-red-50 text-red-600"
                        : task.priority === "Medium"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {task.priority}
                  </span>

                  <span>Created: {task.due || "No created date"}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 ? <div className="p-3 text-sm text-gray-500">No incomplete tasks.</div> : null}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [displayName, setDisplayName] = useState("User");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskSummary, setTaskSummary] = useState({ completed: 0, total: 0 });
  const [heatmapImageUrl, setHeatmapImageUrl] = useState<string | null>(null);
  const [heatmapLoading, setHeatmapLoading] = useState(true);
  const [heatmapError, setHeatmapError] = useState<string | null>(null);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskCompletionDate, setTaskCompletionDate] = useState(getTodayInputDate());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTaskActionLoading, setIsTaskActionLoading] = useState(false);

  const monthIncome = transactions
    .filter((transaction) => transaction.positive && isInCurrentMonth(transaction.date))
    .reduce((sum, transaction) => sum + Math.abs(transaction.amountValue), 0);

  const monthExpenses = transactions
    .filter((transaction) => !transaction.positive && isInCurrentMonth(transaction.date))
    .reduce((sum, transaction) => sum + Math.abs(transaction.amountValue), 0);

  const stats: Stat[] = [
    { label: "Income (This Month)", value: `$${monthIncome.toFixed(2)}` },
    { label: "Expenses (This Month)", value: `$${monthExpenses.toFixed(2)}` },
    {
      label: "Tasks Completed",
      value: `${taskSummary.completed}/${taskSummary.total}`,
      delta: `${Math.max(taskSummary.total - taskSummary.completed, 0)} pending`,
    },
  ];

  const openTaskCompletionModal = (task: Task) => {
    setSelectedTask(task);
    setTaskCompletionDate(task.completedDate ? task.completedDate.split("T")[0] : getTodayInputDate());
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

      setTaskSummary({
        completed: normalizedTasks.filter((task) => Boolean(task.completed)).length,
        total: normalizedTasks.length,
      });

      const incompleteTasks = normalizedTasks
        .filter((task) => !task.completed)
        .sort((a, b) => {
          const priorityDiff = getPriorityRank(a.priority) - getPriorityRank(b.priority);
          if (priorityDiff !== 0) return priorityDiff;
          return getTaskTimestamp(a) - getTaskTimestamp(b);
        });

      setTasks(incompleteTasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const fetchHeatmap = async () => {
    try {
      setHeatmapLoading(true);
      setHeatmapError(null);

      const today = new Date();
      const day = today.getDay(); // Sun=0, Mon=1, ..., Sat=6
      const diffToMonday = day === 0 ? 6 : day - 1;

      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - diffToMonday);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const start = formatDateAsInput(weekStart);
      const end = formatDateAsInput(weekEnd);

      const res = await fetch(`/api/productivity_heatmap?userID=${userID}&start_date=${start}&end_date=${end}`);
      if (!res.ok) {
        throw new Error("Failed to generate heatmap");
      }

      const data = await res.json();
      const imagePath = data?.heatmap?.image_path as string | undefined;
      const imageName = imagePath?.split(/[\\/]/).pop() ?? "heatmap.png";

      setHeatmapImageUrl(`/api/generated/${imageName}?t=${Date.now()}`);
    } catch (err) {
      console.error("Failed to fetch heatmap:", err);
      setHeatmapError("Could not load productivity heatmap.");
      setHeatmapImageUrl(null);
    } finally {
      setHeatmapLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;

    try {
      setIsTaskActionLoading(true);
      const response = await fetch(
        `/api/complete_task?userID=${userID}&task_id=${selectedTask.id}&completed_date=${encodeURIComponent(taskCompletionDate)}`,
        { method: "PUT" }
      );

      if (!response.ok) {
        throw new Error("Failed to complete task");
      }

      closeTaskCompletionModal();
      await Promise.all([fetchTasks(), fetchHeatmap()]);
    } catch (err) {
      console.error("Error completing task:", err);
    } finally {
      setIsTaskActionLoading(false);
    }
  };

  const handleIncompleteTask = async () => {
    if (!selectedTask) return;

    try {
      setIsTaskActionLoading(true);
      const response = await fetch(`/api/incomplete_task?userID=${userID}&task_id=${selectedTask.id}`, { method: "PUT" });

      if (!response.ok) {
        throw new Error("Failed to mark task incomplete");
      }

      closeTaskCompletionModal();
      await Promise.all([fetchTasks(), fetchHeatmap()]);
    } catch (err) {
      console.error("Error marking task incomplete:", err);
    } finally {
      setIsTaskActionLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`/api/get_transactions?userID=${userID}`);
      const data = await res.json();

      const formattedTransactions: Transaction[] = (data.transactions ?? []).map((t: any) => ({
        title: t.merchant ?? "Unknown Transaction",
        date: t.txn_date ?? "",
        amount: `${t.positive ? "+" : "-"}$${Number(t.amount ?? 0).toFixed(2)}`,
        id: String(t.txn_id ?? `${t.merchant}-${t.txn_date}`),
        amountValue: Number(t.amount ?? 0),
        positive: Boolean(t.positive),
      }));

      setTransactions(formattedTransactions);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  const fetchAllEvents = async () => {
    try {
      const res = await fetch(`/api/calendar?userID=${userID}`);
      const data = await res.json();
      const allEvents = Array.isArray(data?.Calendar)
        ? data.Calendar.flatMap((month: any) =>
            Array.isArray(month?.one_time_events) ? month.one_time_events : []
          )
        : [];
      const todayDate = getTodayInputDate();

      const formatTime = (time: string | null) => {
        if (!time) return "All day";
        const match = time.match(/^(\d{2}):(\d{2})/);
        if (!match) return time;

        const hour24 = Number(match[1]);
        const minute = match[2];
        const suffix = hour24 >= 12 ? "PM" : "AM";
        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
        return `${hour12}:${minute} ${suffix}`;
      };

      const filteredEvents = allEvents.filter((e: any) => {
        const startDate = e.start_date?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
        if (!startDate) return false;
        return startDate >= todayDate;
      });

      console.log("[dashboard upcoming] total events from API:", allEvents.length);
      console.log("[dashboard upcoming] today date:", todayDate);
      console.log("[dashboard upcoming] events after filter:", filteredEvents.length);
      console.log(
        "[dashboard upcoming] filtered sample:",
        filteredEvents.slice(0, 10).map((e: any) => ({
          title: e?.title,
          start_date: e?.start_date,
          start_time: e?.start_time,
        }))
      );

      const formattedSchedule: ScheduleItem[] = filteredEvents
        .map((e: any) => {
          const startDateTime = getScheduleStartDateTime(e.start_date, e.start_time);
          const sortTimestamp = startDateTime ? startDateTime.getTime() : Number.MAX_SAFE_INTEGER;

          return {
            title: e.title ?? "Untitled Event",
            start_time: formatTime(e.start_time),
            end_time: formatTime(e.end_time),
            date: formatScheduleDate(e.start_date),
            sortTimestamp,
          };
        })
        .sort((a: ScheduleItem, b: ScheduleItem) => {
          const aTs = a.sortTimestamp ?? Number.MAX_SAFE_INTEGER;
          const bTs = b.sortTimestamp ?? Number.MAX_SAFE_INTEGER;
          return aTs - bTs;
        });

      setSchedule(formattedSchedule);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  useEffect(() => {
    fetchAllEvents();
    fetchTransactions();
    fetchTasks();
    fetchHeatmap();
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadUserName = async () => {
      const name = await fetchUserName(userID);
      if (isActive) setDisplayName(name);
    };

    loadUserName();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const handleTransactionCreated = () => {
      fetchTransactions();
    };
    const handleTaskCreated = () => {
      fetchTasks();
    };
    const handleScheduleCreated = () => {
      fetchAllEvents();
    };

    window.addEventListener(APP_EVENT_TRANSACTION_CREATED, handleTransactionCreated);
    window.addEventListener(APP_EVENT_TASK_CREATED, handleTaskCreated);
    window.addEventListener(APP_EVENT_SCHEDULE_CREATED, handleScheduleCreated);

    return () => {
      window.removeEventListener(APP_EVENT_TRANSACTION_CREATED, handleTransactionCreated);
      window.removeEventListener(APP_EVENT_TASK_CREATED, handleTaskCreated);
      window.removeEventListener(APP_EVENT_SCHEDULE_CREATED, handleScheduleCreated);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {displayName}</h1>
        <p className="text-gray-500">Here's what's happening with your finances and schedule today</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ProductivityHeatmapCard heatmapImageUrl={heatmapImageUrl} isLoading={heatmapLoading} error={heatmapError} />
        </div>
        <div>
          <UpcomingScheduleCard schedule={schedule} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentTransactionsCard
          transactions={transactions}
          onAddTransactionClick={() => setIsAddTransactionModalOpen(true)}
        />
        <TasksCard tasks={tasks} onTaskToggle={openTaskCompletionModal} />
      </div>

      <AddTransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
        userID={userID}
        onTransactionAdded={(newTransaction) =>
          setTransactions((prev) => [
            {
              ...newTransaction,
              amountValue: parseTransactionAmount(newTransaction.amount),
              positive: String(newTransaction.amount).trim().startsWith("+"),
            },
            ...prev,
          ])
        }
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
