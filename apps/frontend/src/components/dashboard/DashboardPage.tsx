import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AddTransactionModal from "../app-shell/AddTransactionModal";

type Stat = { label: string; value: string; delta?: string };

type ScheduleItem = {
  title: string;
  start_time?: string;
  end_time?: string;
  date?: string;
};

type Transaction = {
  title: string;
  date: string;
  amount: string;
  id: string;
};

type Task = {
  title: string;
  priority: "High" | "Medium" | "Low";
  due: string;
  completed?: boolean;
};

const userID = "03d78572-f213-4584-b8b2-e1a34dd1c030";

const stats: Stat[] = [
  { label: "Total Balance", value: "$24,580.00", delta: "+12.5%" },
  { label: "Income (This Month)", value: "$8,450.00", delta: "+8.2%" },
  { label: "Expenses (This Month)", value: "$3,280.00", delta: "+3.1%" },
  { label: "Tasks Completed", value: "24/36", delta: "12 pending" },
];

const tasks: Task[] = [
  { title: "Review Q1 financial reports", priority: "High", due: "Jan 20, 2025" },
  { title: "Prepare client presentation", priority: "Medium", due: "Jan 18, 2025" },
  { title: "Update project timeline", priority: "Low", due: "Jan 22, 2025" },
  { title: "Send invoices to clients", priority: "Medium", due: "Jan 15, 2025", completed: true },
  { title: "Team meeting notes", priority: "Medium", due: "Jan 17, 2025" },
];

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

  const gradient =
    styles[label as keyof typeof styles] || "from-gray-500 to-gray-600";

  const icon = icons[label as keyof typeof icons] || "•";

  return (
    <div className={`rounded-2xl bg-gradient-to-r ${gradient} p-5 text-white shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg">
          {icon}
        </div>
        {delta ? <div className="text-sm font-medium text-white/90">{delta}</div> : null}
      </div>

      <div className="mt-6 text-sm text-white/80">{label}</div>
      <div className="mt-1 text-4xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

<<<<<<< HEAD
function ProductivityHeatmapCard({
  heatmapImageUrl,
  isLoading,
  error,
}: {
  heatmapImageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}) {
=======
function ProductivityHeatmapCard() {
  const days = Array.from({ length: 7 }, (_, i) => i);
  const weeks = Array.from({ length: 16 }, (_, i) => i);

  const levelClass = (lvl: number) => {
    switch (lvl) {
      case 0:
        return "bg-gray-100";
      case 1:
        return "bg-gray-200";
      case 2:
        return "bg-gray-300";
      case 3:
        return "bg-gray-400";
      default:
        return "bg-gray-500";
    }
  };

>>>>>>> cbadbef (Fix: AddScheduleModal + working add button for calendar)
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h3 className="text-base font-semibold text-gray-900">Productivity Heatmap</h3>

        <div className="flex items-center gap-2 text-sm">
          <button className="rounded-md px-3 py-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
            Week
          </button>
          <button className="rounded-md bg-gray-100 px-3 py-1 font-medium text-gray-700">
            Month
          </button>
          <button className="rounded-md px-3 py-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
            Year
          </button>
        </div>
      </div>

      <div className="p-5">
<<<<<<< HEAD
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-sm text-gray-500">
            Generating heatmap...
=======
        <div className="flex gap-1">
          {weeks.map((w) => (
            <div key={w} className="flex flex-col gap-1">
              {days.map((d) => {
                const lvl = (w * 3 + d * 2) % 5;
                return (
                  <div
                    key={`${w}-${d}`}
                    className={`h-4 w-4 rounded ${levelClass(lvl)} border border-gray-100`}
                    title={`Week ${w + 1}, Day ${d + 1}, Level ${lvl}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((lvl) => (
              <div key={lvl} className={`h-4 w-4 rounded ${levelClass(lvl)} border border-gray-100`} />
            ))}
>>>>>>> cbadbef (Fix: AddScheduleModal + working add button for calendar)
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
        {schedule.slice(0, 3).map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="flex gap-3 rounded-xl border border-gray-100 p-3"
          >
            <div className="mt-1 h-10 w-1 rounded-full bg-gray-300" />
            <div>
              <div className="text-sm font-medium text-gray-900">{item.title}</div>
              <div className="text-xs text-gray-500">
                {item.start_time} - {item.end_time}
              </div>
              {item.date ? <div className="mt-1 text-xs text-gray-400">{item.date}</div> : null}
            </div>
          </div>
        ))}
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
          <div
            key={`${t.id}-${t.date}`}
            className="flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-sm">
                {t.amount.startsWith("+") ? "💼" : "🛒"}
              </div>

              <div>
                <div className="text-sm font-medium text-gray-900">{t.title}</div>
                <div className="text-xs text-gray-500">{t.date}</div>
              </div>
            </div>

            <div
              className={`text-sm font-semibold ${
                t.amount.startsWith("+") ? "text-green-600" : "text-gray-700"
              }`}
            >
              {t.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActiveTasksCard({ tasks }: { tasks: Task[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h3 className="text-base font-semibold text-gray-900">Active Tasks</h3>
        <button className="text-sm font-medium text-gray-400 transition hover:text-gray-600">
          View All
        </button>
      </div>

      <div className="space-y-1 p-3">
        {tasks.map((task, index) => (
          <div
            key={`${task.title}-${index}`}
            className="flex items-start justify-between rounded-xl px-3 py-3 transition hover:bg-gray-50"
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={!!task.completed}
                readOnly
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />

              <div>
                <div
                  className={`text-sm font-medium ${
                    task.completed ? "text-gray-400 line-through" : "text-gray-900"
                  }`}
                >
                  {task.title}
                </div>

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

                  <span>Due: {task.due}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [heatmapImageUrl, setHeatmapImageUrl] = useState<string | null>(null);
  const [heatmapLoading, setHeatmapLoading] = useState(true);
  const [heatmapError, setHeatmapError] = useState<string | null>(null);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);

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
        }));

        setTransactions(formattedTransactions);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      }
    };

    const fetchAllEvents = async () => {
      try {
        const res = await fetch(`/api/events?userID=${userID}`);
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
        };

        const formattedSchedule: ScheduleItem[] = (data.data ?? []).map((e: any) => ({
          title: e.title ?? "Untitled Event",
          start_time: formatTime(e.start_time),
          end_time: formatTime(e.end_time),
          date: formatDate(e.start_date),
        }));

        setSchedule(formattedSchedule);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };

<<<<<<< HEAD
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
  fetchHeatmap();


=======
    fetchTransactions();
    fetchAllEvents();
>>>>>>> cbadbef (Fix: AddScheduleModal + working add button for calendar)
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, John</h1>
        <p className="text-gray-500">Here's what's happening with your finances and schedule today</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

<<<<<<< HEAD
      {/* Main row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ProductivityHeatmapCard
            heatmapImageUrl={heatmapImageUrl}
            isLoading={heatmapLoading}
            error={heatmapError}
          />
=======
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ProductivityHeatmapCard />
>>>>>>> cbadbef (Fix: AddScheduleModal + working add button for calendar)
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
        <ActiveTasksCard tasks={tasks} />
      </div>

      <AddTransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
        userID={userID}
        onTransactionAdded={(newTransaction) =>
          setTransactions((prev) => [newTransaction, ...prev])
        }
      />
    </div>
  );
}