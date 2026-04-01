import React from "react";

export default function CalendarPage() {
  const events = [
    { title: "Biology Lecture", day: "Monday", time: "9:00 AM – 10:15 AM" },
    { title: "Study Group", day: "Tuesday", time: "6:00 PM – 7:30 PM" },
    { title: "Work Shift", day: "Wednesday", time: "3:00 PM – 8:00 PM" },
    { title: "Project Meeting", day: "Friday", time: "1:00 PM – 2:00 PM" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-gray-500">See your upcoming schedule and key events.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b px-5 py-3">
          <h2 className="font-medium text-gray-900">This Week</h2>
        </div>
        <div className="p-5 space-y-4">
          {events.map((event) => (
            <div key={`${event.title}-${event.day}`} className="border-l-2 border-gray-300 pl-4">
              <div className="font-medium text-gray-900">{event.title}</div>
              <div className="text-sm text-gray-500">{event.day}</div>
              <div className="text-sm text-gray-500">{event.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
