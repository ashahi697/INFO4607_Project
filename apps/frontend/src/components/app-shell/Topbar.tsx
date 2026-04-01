import React from "react";

export default function Topbar() {
  return (
    <header className="w-full h-16 border-b bg-white flex items-center justify-between px-6">
      <input
        className="border rounded px-3 py-2 w-[420px]"
        placeholder="Search transactions, tasks, events..."
      />

      <div className="flex items-center gap-4">
        <button aria-label="Notifications">🔔</button>
        <button aria-label="Messages">✉️</button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="text-sm">
            <div className="font-medium">John Doe</div>
            <div className="text-gray-500 text-xs">Premium Plan</div>
          </div>
        </div>
      </div>
    </header>
  );
}
