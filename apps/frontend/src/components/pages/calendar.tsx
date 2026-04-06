import { useEffect, useState } from "react";
import { userID } from "../../App";

export default function CalendarPage() {
  type CalendarEvent = {
    event_id: string;
    title: string;
    start_date: string;
    start_time?: string | null;
    end_time?: string | null;
  };

  type MonthSection = {
    monthLabel: string;
    events: CalendarEvent[];
  };

  const [months, setMonths] = useState<MonthSection[]>([]);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await fetch(`/api/calendar?userID=${userID}`);
        const data = await res.json();
        const normalizedCalendar: MonthSection[] = data.Calendar.map((month: any) => ({
          monthLabel: `${month.name} ${month.year}`,
          events: month.one_time_events,
        }));
        setMonths(normalizedCalendar);

        const now = new Date();
        const currentMonthLabel = `${now.toLocaleString("en-US", { month: "long" })} ${now.getFullYear()}`;
        const currentMonthIndex = normalizedCalendar.findIndex((month) => month.monthLabel === currentMonthLabel);
        setSelectedMonthIndex(currentMonthIndex >= 0 ? currentMonthIndex : 0);

        console.log("Normalized calendar:", normalizedCalendar);
      } catch (err) {
        console.error("Failed to fetch calendar:", err);
      }
    };

    fetchCalendar();
  }, []);

  const formatTime = (time?: string | null) => {
    if (!time) return "All day";
    const match = time.match(/^(\d{2}):(\d{2})/);
    if (!match) return time;
    const hour24 = Number(match[1]);
    const minute = match[2];
    const suffix = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${hour12}:${minute} ${suffix}`;
  };

  const getDayOfMonth = (isoDate?: string) => {
    const parsed = new Date(isoDate ?? "");
    return parsed.getDate();
  };

  const selectedMonth = months[selectedMonthIndex];
  const selectedMonthEvents = selectedMonth
    ? [...selectedMonth.events].sort((a, b) => getDayOfMonth(a.start_date) - getDayOfMonth(b.start_date))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-gray-500">See your upcoming schedule and key events.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b px-5 py-3">
          <div className="grid grid-cols-3 items-center">
            <div>
              <button
                type="button"
                onClick={() => setSelectedMonthIndex((index) => Math.max(0, index - 1))}
                disabled={selectedMonthIndex === 0}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous month"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            </div>
            <h2 className="text-center font-medium text-gray-900">
              {selectedMonth ? selectedMonth.monthLabel : "No Months"}
            </h2>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMonthIndex((index) => Math.min(months.length - 1, index + 1))}
                disabled={months.length === 0 || selectedMonthIndex >= months.length - 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next month"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {selectedMonth && selectedMonthEvents.length === 0 ? (
            <div className="text-sm text-gray-500">No scheduled events for this month.</div>
          ) : null}
          {selectedMonthEvents.length > 0
            ? selectedMonthEvents.map((event, index) => (
              <div key={event.event_id ?? `${event.title}-${index}`} className="border-l-2 border-gray-300 pl-4">
                <div className="font-medium text-gray-900">{event.title}</div>
                <div className="text-sm text-gray-500">Day {getDayOfMonth(event.start_date)}</div>
                <div className="text-sm text-gray-500">
                  {formatTime(event.start_time)}{event.end_time ? ` - ${formatTime(event.end_time)}` : ""}
                </div>
              </div>
            ))
            : null}
        </div>
      </div>
    </div>
  );
}
