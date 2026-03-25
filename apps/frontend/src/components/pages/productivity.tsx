import React from "react";

export default function ProductivityPage() {
  const tasks = [
    { title: "Finish economics assignment", priority: "High", status: "In Progress" },
    { title: "Review chemistry notes", priority: "Medium", status: "Planned" },
    { title: "Prepare presentation slides", priority: "High", status: "Completed" },
    { title: "Read chapter 6", priority: "Low", status: "Planned" },
  ];

  const habits = [
    { label: "Focus Sessions", value: "12 this week" },
    { label: "Average Deep Work", value: "2.3 hrs/day" },
    { label: "Best Time", value: "9 AM – 12 PM" },
    { label: "Completion Rate", value: "72%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Productivity</h1>
        <p className="text-gray-500">View task progress, work patterns, and focus habits.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {habits.map((item) => (
          <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">{item.label}</div>
            <div className="mt-2 text-xl font-semibold text-gray-900">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b px-5 py-3">
          <h2 className="font-medium text-gray-900">Task Overview</h2>
        </div>
        <div className="p-5 space-y-4">
          {tasks.map((task) => (
            <div key={task.title} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
              <div>
                <div className="font-medium text-gray-900">{task.title}</div>
                <div className="text-sm text-gray-500">{task.priority} Priority</div>
              </div>
              <div className="text-sm font-medium text-gray-700">{task.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
