import React from 'react';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AddTransactionModal from "../app-shell/AddTransactionModal";

type Stat = { label: string; value: string; delta?: string };
type ScheduleItem = { title: string; start_time?: string; end_time?: string, date?: string };
type Transaction = { title: string; date: string; amount: string; id: string };
type Task = { title: string; priority: "High" | "Medium" | "Low"; due: string; completed?: boolean };

const userID = "03d78572-f213-4584-b8b2-e1a34dd1c030"; // TODO: get from auth context


const stats: Stat[] = [
  { label: "Total Balance", value: "$24,580.00", delta: "+12.5%" },
  { label: "Income (This Month)", value: "$8,450.00", delta: "+8.2%" },
  { label: "Expenses (This Month)", value: "$3,280.00", delta: "+3.1%" },
  { label: "Tasks Completed", value: "24/36", delta: "12 pending" },
];

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


const tasks: Task[] = [
  { title: "Review Q1 financial reports", priority: "High", due: "Jan 20, 2025" },
  { title: "Prepare client presentation", priority: "Medium", due: "Jan 18, 2025" },
  { title: "Update project timeline", priority: "Low", due: "Jan 22, 2025" },
  { title: "Send invoices to clients", priority: "Medium", due: "Jan 15, 2025", completed: true },
  { title: "Team meeting notes", priority: "Medium", due: "Jan 17, 2025" },
];

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

/**
 * Simple “placeholder” productivity heatmap.
 * We’ll replace this later with a real grid + data (and eventually LLM feedback).
 */
function ProductivityHeatmapCard() {
  const days = Array.from({ length: 7 }, (_, i) => i);
  const weeks = Array.from({ length: 16 }, (_, i) => i);

  // 0–4 intensity
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
        <div className="flex gap-1">
          {weeks.map((w) => (
            <div key={w} className="flex flex-col gap-1">
              {days.map((d) => {
                const lvl = (w * 3 + d * 2) % 5; // deterministic “random-ish”
                return (
                  <div
                    key={`${w}-${d}`}
                    className={`w-4 h-4 rounded ${levelClass(lvl)} border border-gray-100`}
                    title={`Week ${w + 1}, Day ${d + 1} • Level ${lvl}`}
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
              <div key={lvl} className={`w-4 h-4 rounded ${levelClass(lvl)} border border-gray-100`} />
            ))}
          </div>
          <span>More</span>
        </div>
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

function TasksCard() {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <PanelHeader title="Active Tasks" right={<button className="text-sm text-gray-500 hover:text-gray-700">View All</button>} />
      <div className="p-5 space-y-4">
        {tasks.map((task) => (
          <label key={task.title} className="flex items-start gap-3">
            <input type="checkbox" defaultChecked={!!task.completed} className="mt-1" />
            <div className="flex-1">
              <div className={`font-medium ${task.completed ? "line-through text-gray-400" : ""}`}>{task.title}</div>
              <div className="text-sm text-gray-500">
                <span className="inline-block px-2 py-0.5 rounded bg-gray-100 mr-2">{task.priority} Priority</span>
                <span>Due: {task.due}</span>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
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

  fetchAllEvents();
  fetchTransactions();


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
          <ProductivityHeatmapCard />
        </div>
        <ScheduleCard schedule={schedule}/>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TransactionsCard
          transactions={transactions}
          onAddTransactionClick={() => setIsAddTransactionModalOpen(true)}        />
        <TasksCard />
      </div>

      <AddTransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
        userID={userID}
        onTransactionAdded={(newTransaction) => setTransactions((prev) => [newTransaction, ...prev])}
      />
    </div>
  );
}
