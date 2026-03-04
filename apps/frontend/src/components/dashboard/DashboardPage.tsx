import React from "react";

type Stat = { label: string; value: string; delta?: string };
type ScheduleItem = { title: string; time: string };
type Transaction = { title: string; date: string; amount: string; category: string };
type Task = { title: string; priority: "High" | "Medium" | "Low"; due: string; completed?: boolean };

const stats: Stat[] = [
  { label: "Total Balance", value: "$24,580.00", delta: "+12.5%" },
  { label: "Income (This Month)", value: "$8,450.00", delta: "+8.2%" },
  { label: "Expenses (This Month)", value: "$3,280.00", delta: "+3.1%" },
  { label: "Tasks Completed", value: "24/36", delta: "12 pending" },
];

const schedule: ScheduleItem[] = [
  { title: "Team Meeting", time: "9:00 AM – 10:00 AM" },
  { title: "Client Presentation", time: "2:00 PM – 3:30 PM" },
  { title: "Project Review", time: "4:30 PM – 5:30 PM" },
];

const transactions: Transaction[] = [
  { title: "Amazon Purchase", date: "Jan 15, 2025", amount: "-$89.99", category: "Shopping" },
  { title: "Salary Deposit", date: "Jan 14, 2025", amount: "+$4,500.00", category: "Income" },
  { title: "Restaurant Bill", date: "Jan 13, 2025", amount: "-$45.50", category: "Food" },
  { title: "Gas Station", date: "Jan 12, 2025", amount: "-$52.00", category: "Transport" },
  { title: "Software Subscription", date: "Jan 11, 2025", amount: "-$29.99", category: "Subscription" },
];

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

function ScheduleCard() {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <PanelHeader title="Today's Schedule" right={<button className="text-sm text-gray-500 hover:text-gray-700">View All</button>} />
      <div className="p-5 space-y-4">
        {schedule.map((item) => (
          <div key={item.title} className="border-l-2 border-gray-300 pl-3">
            <div className="font-medium">{item.title}</div>
            <div className="text-sm text-gray-500">{item.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionsCard() {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <PanelHeader title="Recent Transactions" right={<button className="text-sm text-gray-500 hover:text-gray-700">View All</button>} />
      <div className="p-5 space-y-4">
        {transactions.map((t) => (
          <div key={`${t.title}-${t.date}`} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{t.title}</div>
              <div className="text-sm text-gray-500">
                {t.date} • {t.category}
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
        <ScheduleCard />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TransactionsCard />
        <TasksCard />
      </div>
    </div>
  );
}
