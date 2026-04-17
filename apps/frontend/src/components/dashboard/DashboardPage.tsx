import React from 'react';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AddTransactionModal from "../app-shell/AddTransactionModal";

type Stat = { label: string; value: string; delta?: string };
type ScheduleItem = { title: string; start_time?: string; end_time?: string, date?: string };
type Transaction = { title: string; date: string; amount: string; id: string; amountValue: number; positive: boolean };
type Task = {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  due: string;
  completed?: boolean;
  createdAt?: string;
};

const userID = "03d78572-f213-4584-b8b2-e1a34dd1c030"; // TODO: get from auth context

/*const schedule: ScheduleItem[] = [
  { title: "Team Meeting", time: "9:00 AM – 10:00 AM" },
  { title: "Client Presentation", time: "2:00 PM – 3:30 PM" },
  { title: "Project Review", time: "4:30 PM – 5:30 PM" },
];*/

/*const transactions: Transaction[] = [
  { title: "Amazon Purchase", date: "Jan 15, 2025", amount: "-$89.99", id: "1" },
  { title: "Salary Deposit", date: "Jan 14, 2025", amount: "+$4,500.00", id: "2" },
  { title: "Restaurant Bill", date: "Jan 13, 2025", amount: "-$45.50", id: "3" },
  { title: "Gas Station", date: "Jan 12, 2025", amount: "-$52.00", id: "4" },
  { title: "Software Subscription", date: "Jan 11, 2025", amount: "-$29.99", id: "5" }, 
]; */


const MAX_DASHBOARD_TASKS = 5;

const normalizePriority = (task: any): "High" | "Medium" | "Low" => {
  const rawPriority = task?.priority;
  if (rawPriority === "High" || rawPriority === "Medium" || rawPriority === "Low") {
    return rawPriority;
  }

  const weight = Number(task?.priority_weight ?? task?.priorityWeight);
  if (!Number.isNaN(weight)) {
    if (weight >= 8) return "High";
    if (weight >= 4) return "Medium";
  }

  return "Low";
};

const formatTaskDate = (rawDate: string | undefined): string => {
  if (!rawDate) return "";

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return rawDate;
  }

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

const parseTransactionAmount = (rawAmount: string): number => {
  const parsed = Number(rawAmount.replace(/[^0-9.-]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const isInCurrentMonth = (rawDate: string): boolean => {
  if (!rawDate) return false;

  const parsedDate = new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) return false;

  const now = new Date();
  return (
    parsedDate.getMonth() === now.getMonth() &&
    parsedDate.getFullYear() === now.getFullYear()
  );
};

function PanelHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b px-5 py-3">
      <h3 className="font-medium">{title}</h3>
      {right}
    </div>
  );
}

function StatCard({ label, value, delta }: Stat) {
  return (
    <div className="bg-white border rounded-xl p-5 flex items-start justify-between">
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-semibold mt-2">{value}</div>
      </div>
      {delta ? <div className="text-sm text-gray-500">{delta}</div> : null}
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
    <div className="bg-white border rounded-xl overflow-hidden">
      <PanelHeader
        title="Productivity Heatmap"
        right={
          <div className="text-sm text-gray-500 flex gap-4">
            <button className="hover:text-gray-700">Week</button>
            <button className="font-medium text-gray-800">Month</button>
            <button className="hover:text-gray-700">Year</button>
          </div>
        }
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

function ScheduleCard({ schedule }: { schedule: ScheduleItem[] }) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <PanelHeader title="Upcoming Schedule" right={
       <Link to="/calendar" className="text-sm text-gray-500 hover:text-gray-700">
              View All
            </Link>
       } />
      <div className="p-5 space-y-4">
        {schedule.slice(0,3).map((item) => (
          <div key={item.title} className="border-l-2 border-gray-300 pl-3">
            <div className="font-medium">{item.title}</div>
            <div className="text-sm text-gray-500">Start: {item.start_time} | End: {item.end_time} | Date: {item.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionsCard({
  transactions,
  onAddTransactionClick,
  }: {
    transactions: Transaction[];
    onAddTransactionClick: () => void;
  })
  
{
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <PanelHeader
        title="Recent Transactions"
        right={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onAddTransactionClick}
              aria-label="Add transaction"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 pb-px text-base font-semibold leading-none text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
            >
              +
            </button>
            <Link to="/financial" className="text-sm text-gray-500 hover:text-gray-700">
              View All
            </Link>
          </div>
        }
      />
      <div className="p-5 space-y-4">
        {transactions.slice(0, 5).map((t) => (
          <div key={`${t.title}-${t.date}`} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{t.title}</div>
              <div className="text-sm text-gray-500">
                {t.date}
              </div>
            </div>
            <div className="font-medium">{t.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TasksCard({ tasks }: { tasks: Task[] }) {
  const visibleTasks = tasks.slice(0, MAX_DASHBOARD_TASKS);

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <PanelHeader title="Active Tasks" right={<Link to="/productivity" className="text-sm text-gray-500 hover:text-gray-700">View All</Link>} />
      <div className="p-5 space-y-4">
        {visibleTasks.map((task) => (
          <label key={task.id} className="flex items-start gap-3">
            <input type="checkbox" defaultChecked={!!task.completed} className="mt-1" />
            <div className="flex-1">
              <div className={`font-medium ${task.completed ? "line-through text-gray-400" : ""}`}>{task.title}</div>
              <div className="text-sm text-gray-500">
                <span className="inline-block px-2 py-0.5 rounded bg-gray-100 mr-2">{task.priority} Priority</span>
                <span>Due: {task.due || "No due date"}</span>
              </div>
            </div>
          </label>
        ))}
        {visibleTasks.length === 0 ? (
          <div className="text-sm text-gray-500">No incomplete tasks.</div>
        ) : null}
      </div>
    </div>
  );
}

export default function DashboardPage() {

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskSummary, setTaskSummary] = useState({ completed: 0, total: 0 });
  const [heatmapImageUrl, setHeatmapImageUrl] = useState<string | null>(null);
  const [heatmapLoading, setHeatmapLoading] = useState(true);
  const [heatmapError, setHeatmapError] = useState<string | null>(null);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);

  const monthIncome = transactions
    .filter((transaction) => transaction.positive && isInCurrentMonth(transaction.date))
    .reduce((sum, transaction) => sum + Math.abs(transaction.amountValue), 0);

  const monthExpenses = transactions
    .filter((transaction) => !transaction.positive && isInCurrentMonth(transaction.date))
    .reduce((sum, transaction) => sum + Math.abs(transaction.amountValue), 0);

  const stats: Stat[] = [
    { label: "Total Balance", value: "$24,580.00", delta: "+12.5%" },
    { label: "Income (This Month)", value: `$${monthIncome.toFixed(2)}` },
    { label: "Expenses (This Month)", value: `$${monthExpenses.toFixed(2)}` },
    {
      label: "Tasks Completed",
      value: `${taskSummary.completed}/${taskSummary.total}`,
      delta: `${Math.max(taskSummary.total - taskSummary.completed, 0)} pending`,
    },
  ];

  useEffect(() => {
  const fetchTransactions = async () => {
    try {
      const res = await fetch(`/api/get_transactions?userID=${userID}`);
      const data = await res.json();

      const formattedTransactions: Transaction[] = (data.transactions ?? []).map((t: any) => ({
        title: t.merchant ?? "Unknown Transaction",
        date: t.txn_date ?? "",
        amount: `${t.positive ? "+" : "-"}$${Number(t.amount ?? 0).toFixed(2)}`,
        id: t.txn_id,
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
    const res = await fetch(`api/events?userID=${userID}`);
    const data = await res.json();

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

    const formatDate = (date: string | null) => {
      if (!date) return "";

      return new Date(date).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      // Example: "Mar 5, 2026"
    };

    const formattedSchedule: ScheduleItem[] = (data.data ?? []).map((e: any) => ({
      title: e.title ?? "Untitled Event",
      start_time: formatTime(e.start_time),
      end_time: formatTime(e.end_time),
      date: formatDate(e.start_date),
    }));

    setSchedule(formattedSchedule);
      console.log("formatted schedule:", formattedSchedule);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
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
            createdAt: task.created_at ?? task.due_date ?? task.due ?? "",
          }))
        : [];

      setTaskSummary({
        completed: normalizedTasks.filter((task) => Boolean(task.completed)).length,
        total: normalizedTasks.length,
      });

      const incompleteTasks = normalizedTasks
        .filter((task) => !task.completed)
        .sort((a, b) => getTaskTimestamp(a) - getTaskTimestamp(b));

      setTasks(incompleteTasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const fetchHeatmap = async () => {
    try {
      setHeatmapLoading(true);
      setHeatmapError(null);

      // Keep dashboard heatmap to one column (current week) with one row per day.
      const today = new Date();
      const day = today.getDay(); // Sun=0, Mon=1, ..., Sat=6
      const diffToMonday = day === 0 ? 6 : day - 1;

      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - diffToMonday);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const start = weekStart.toISOString().split("T")[0];
      const end = weekEnd.toISOString().split("T")[0];

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

  fetchAllEvents();
  fetchTransactions();
  fetchTasks();
  fetchHeatmap();


  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, John</h1>
        <p className="text-gray-500">Here's what's happening with your finances and schedule today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Main row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ProductivityHeatmapCard
            heatmapImageUrl={heatmapImageUrl}
            isLoading={heatmapLoading}
            error={heatmapError}
          />
        </div>
        <ScheduleCard schedule={schedule}/>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TransactionsCard
          transactions={transactions}
          onAddTransactionClick={() => setIsAddTransactionModalOpen(true)}        />
        <TasksCard tasks={tasks} />
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
    </div>
  );
}
