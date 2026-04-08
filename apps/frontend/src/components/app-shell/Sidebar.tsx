import React from "react";
import { NavLink } from "react-router-dom";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import QuickAddModal from "../quick-add/QuickAddModal";
const navItems = [
  { label: "Dashboard", path: "/", icon: "🏠" },
  { label: "Financial", path: "/financial", icon: "💳" },
  { label: "Productivity", path: "/productivity", icon: "✅" },
  { label: "Calendar", path: "/calendar", icon: "📅" },
];

export default function Sidebar() {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white px-4 py-5">
      <div className="mb-6 text-lg font-semibold text-gray-900">ProLifiq</div>

      <div className="mb-6">
        <button
  onClick={() => setIsQuickAddOpen(true)}
  className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white transition hover:bg-gray-700"
>
  + Quick Add
</button>
      </div>
      
  {isQuickAddOpen && (
    <div className="mt-4 rounded-lg bg-gray-100 p-3 text-sm">
      Modal is working
    </div>
)}

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
