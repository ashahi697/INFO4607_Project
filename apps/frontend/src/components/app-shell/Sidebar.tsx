import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Financial", path: "/financial" },
  { label: "Productivity", path: "/productivity" },
  { label: "Calendar", path: "/calendar" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white px-4 py-5">
      <div className="mb-6 text-lg font-semibold text-gray-900">Prolifiq</div>

      <div className="mb-6">
        <button className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white">
          + Quick Add
        </button>
      </div>

      <nav className="space-y-3">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-gray-100 font-medium text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 text-sm text-gray-500">⚙ Settings</div>
    </aside>
  );
}
