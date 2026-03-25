import React from "react";
import { NavLink } from "react-router-dom";

const navSections = [
  {
    title: "Dashboard",
    items: [
      { label: "Overview", path: "/" },
      { label: "Analytics", path: "/" },
    ],
  },
  {
    title: "Financial",
    items: [
      { label: "Accounts", path: "/financial" },
      { label: "Transactions", path: "/financial" },
      { label: "Invoices", path: "/financial" },
      { label: "Budget", path: "/financial" },
    ],
  },
  {
    title: "Productivity",
    items: [
      { label: "Tasks", path: "/productivity" },
      { label: "Projects", path: "/productivity" },
      { label: "Notes", path: "/productivity" },
    ],
  },
  {
    title: "Calendar",
    items: [
      { label: "My Calendar", path: "/calendar" },
      { label: "Meetings", path: "/calendar" },
      { label: "Reminders", path: "/calendar" },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white px-4 py-5">
      <div className="mb-6 text-lg font-semibold text-gray-900">ProLifiq</div>

      <div className="mb-6">
        <button className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white">
          + Quick Add
        </button>
      </div>

      <nav className="space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {section.title}
            </div>

            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={`${section.title}-${item.label}`}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2 text-sm transition ${
                        isActive
                          ? "bg-gray-100 font-medium text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-8 text-sm text-gray-500">⚙ Settings</div>
    </aside>
  );
}
