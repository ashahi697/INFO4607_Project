import React from "react";

const navSections = [
  {
    title: "Dashboard",
    items: ["Overview", "Analytics"],
  },
  {
    title: "Financial",
    items: ["Accounts", "Transactions", "Invoices", "Budget"],
  },
  {
    title: "Productivity",
    items: ["Tasks", "Projects", "Notes"],
  },
  {
    title: "Calendar",
    items: ["My Calendar", "Meetings", "Reminders"],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-100 border-r flex flex-col justify-between">
      
      <div>
        <div className="p-4 font-bold text-lg">ProLifiq</div>

        <div className="px-4 pb-4">
          <button className="w-full bg-gray-700 text-white py-2 rounded">
            + Quick Add
          </button>
        </div>

        <nav className="space-y-6 px-4">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="text-xs text-gray-500 uppercase mb-2">
                {section.title}
              </div>

              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item}>
                    <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-200">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="p-4 text-sm text-gray-500">
        ⚙ Settings
      </div>
    </aside>
  );
}
