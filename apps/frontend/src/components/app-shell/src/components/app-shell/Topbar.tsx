import React from "react";

export default function Topbar() {
  return (
    <header className="w-full h-16 border-b flex items-center justify-between px-6 bg-white">
      <input
        className="border rounded px-3 py-1 w-96"
        placeholder="Search transactions, tasks, events..."
      />

      <div className="flex items-center gap-4">
        <span>🔔</span>
        <span>📩</span>
        <div className="flex items-center gap-2">
          <span className="font-medium">John Doe</span>
        </div>
      </div>
    </header>
  );
}
