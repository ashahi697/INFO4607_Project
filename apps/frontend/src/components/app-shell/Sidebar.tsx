import { useState } from "react";
import { NavLink } from "react-router-dom";
import AddTransactionModal from "./AddTransactionModal";
import AddTaskModal from "./AddTaskModal";
import AddScheduleModal from "./AddScheduleModal";

const navItems = [
  { label: "Dashboard", path: "/", icon: "🏠" },
  { label: "Financial", path: "/financial", icon: "💳" },
  { label: "Productivity", path: "/productivity", icon: "✅" },
  { label: "Calendar", path: "/calendar", icon: "📅" },
];

type SidebarProps = {
  userID: string;
  onTransactionAdded: (transaction: {
    title: string;
    date: string;
    amount: string;
    id: string;
  }) => void;
  onTaskAdded: (task: {
    title: string;
    priority: string;
    due: string;
    completed: boolean;
    id: string;
  }) => void;
  onScheduleAdded: (schedule: {
    title: string;
    start_date: string;
    end_date?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    id: string;
  }) => void;
};

export default function Sidebar({
  userID,
  onTransactionAdded,
  onTaskAdded,
  onScheduleAdded,
}: SidebarProps) {
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white px-4 py-5">
      <div className="mb-6 text-lg font-semibold text-gray-900">ProLifiq</div>

      <div className="mb-6 space-y-2">
        <button
          onClick={() => setIsTransactionOpen(true)}
          className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white transition hover:bg-gray-700"
        >
          + Add Transaction
        </button>

        <button
          onClick={() => setIsTaskOpen(true)}
          className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white transition hover:bg-gray-600"
        >
          + Add Task
        </button>

        <button
          onClick={() => setIsScheduleOpen(true)}
          className="w-full rounded-lg bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-500"
        >
          + Add Event
        </button>
      </div>

      <AddTransactionModal
        isOpen={isTransactionOpen}
        onClose={() => setIsTransactionOpen(false)}
        userID={userID}
        onTransactionAdded={onTransactionAdded}
      />

      <AddTaskModal
        isOpen={isTaskOpen}
        onClose={() => setIsTaskOpen(false)}
        userID={userID}
        onTaskAdded={onTaskAdded}
      />

      <AddScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        userID={userID}
        onScheduleAdded={onScheduleAdded}
      />

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-gray-100 font-semibold text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-8 text-sm text-gray-500">⚙ Settings</div>
    </aside>
  );
}
