import { useEffect, useMemo, useState } from "react";
import { userID } from "../../App";
import AddScheduleModal from "../app-shell/AddScheduleModal";

type CalendarEvent = {
  event_id?: string;
  title: string;
  start_date: string;
  start_time?: string | null;
  end_time?: string | null;
};

type MonthSection = {
  monthLabel: string;
  events: CalendarEvent[];
};

function formatTime(time?: string | null) {
  if (!time) return "All day";

  const match = time.match(/^(\d{2}):(\d{2})/);
  if (!match) return time;

  const hour24 = Number(match[1]);
  const minute = match[2];
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return `${hour12}:${minute} ${suffix}`;
}

function formatFullDate(date: string) {
  return new Date(date).toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="mt-1 h-12 w-1 rounded-full bg-blue-500" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-gray-900">{event.title}</div>
          <div className="mt-1 text-sm text-gray-500">{formatFullDate(event.start_date)}</div>
          <div className="mt-1 text-xs text-gray-400">
            {formatTime(event.start_time)} {event.end_time ? `- ${formatTime(event.end_time)}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCalendarState() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
        📅
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">No calendar items yet</h3>
      <p className="mt-2 text-sm text-gray-500">
        Once events are added, they’ll show up here grouped by month and in your upcoming events list.
      </p>
    </div>
  );
}

export default function CalendarPage() {
  const [months, setMonths] = useState<MonthSection[]>([]);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);

const handleScheduleAdded = (newSchedule: {
  title: string;
  day?: string;
  time?: string;
  id: string;
}) => {
  const today = new Date();
  const monthLabel = `${today.toLocaleString("en-US", { month: "long" })} ${today.getFullYear()}`;

  const newEvent = {
    event_id: newSchedule.id,
    title: newSchedule.title,
    start_date: today.toISOString(),
    start_time: newSchedule.time?.split(" - ")[0] || null,
    end_time: newSchedule.time?.split(" - ")[1] || null,
  };

  setMonths((prev) => {
    const existingIndex = prev.findIndex((m) => m.monthLabel === monthLabel);

    if (existingIndex >= 0) {
      const updated = [...prev];
      updated[existingIndex] = {
        ...updated[existingIndex],
        events: [newEvent, ...updated[existingIndex].events],
      };
      return updated;
    }

    return [{ monthLabel, events: [newEvent] }, ...prev];
  });
};

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await fetch(`/api/calendar?userID=${userID}`);
        const data = await res.json();

        const normalizedCalendar: MonthSection[] = Array.isArray(data?.Calendar)
          ? data.Calendar.map((month: any) => ({
              monthLabel: `${month.month_name} ${month.year}`,
              events: Array.isArray(month.one_time_events) ? month.one_time_events : [],
            }))
          : [];

        setMonths(normalizedCalendar);

        if (normalizedCalendar.length > 0) {
          const now = new Date();
          const currentMonthLabel = `${now.toLocaleString("en-US", {
            month: "long",
          })} ${now.getFullYear()}`;

          const currentMonthIndex = normalizedCalendar.findIndex(
            (month) => month.monthLabel === currentMonthLabel
          );

          setSelectedMonthIndex(currentMonthIndex >= 0 ? currentMonthIndex : 0);
        }
      } catch (error) {
        console.error("Error fetching calendar:", error);
      }
    };

    fetchCalendar();
  }, []);

  const selectedMonth = months[selectedMonthIndex];

  const allEvents = useMemo(() => {
    return months.flatMap((month) => month.events);
  }, [months]);

  const upcomingEvents = useMemo(() => {
    return [...allEvents]
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 5);
  }, [allEvents]);

  const totalEvents = allEvents.length;
  const thisMonthCount = selectedMonth?.events.length ?? 0;
  const allDayCount = allEvents.filter((e) => !e.start_time).length;
  const timedCount = allEvents.filter((e) => !!e.start_time).length;
  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
  <div>
    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Calendar</h1>
    <p className="mt-2 text-sm text-gray-500">
      See your upcoming schedule, browse by month, and keep track of important events.
    </p>
  </div>

  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
    <button
      onClick={() => setIsAddScheduleModalOpen(true)}
      className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
    >
      Add Schedule
    </button>

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="text-xs text-gray-500">Total Events</div>
        <div className="mt-1 text-xl font-semibold text-gray-900">{totalEvents}</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="text-xs text-gray-500">This Month</div>
        <div className="mt-1 text-xl font-semibold text-gray-900">{thisMonthCount}</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="text-xs text-gray-500">Timed Events</div>
        <div className="mt-1 text-xl font-semibold text-gray-900">{timedCount}</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="text-xs text-gray-500">All Day</div>
        <div className="mt-1 text-xl font-semibold text-gray-900">{allDayCount}</div>
      </div>
    </div>
  </div>
</div>
      <AddScheduleModal
        isOpen={isAddScheduleModalOpen}
        onClose={() => setIsAddScheduleModalOpen(false)}
        userID={userID}
        onScheduleAdded={handleScheduleAdded}
      />
      {/* Month Navigator */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <button
            type="button"
            onClick={() => setSelectedMonthIndex((prev) => Math.max(prev - 1, 0))}
            disabled={selectedMonthIndex === 0}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ‹
          </button>

          <div className="text-sm font-semibold text-gray-900">
            {selectedMonth ? selectedMonth.monthLabel : "No Months"}
          </div>

          <button
            type="button"
            onClick={() =>
              setSelectedMonthIndex((prev) => Math.min(prev + 1, Math.max(months.length - 1, 0)))
            }
            disabled={selectedMonthIndex >= months.length - 1 || months.length === 0}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ›
          </button>
        </div>

        <div className="px-5 py-4">
          {months.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {months.map((month, index) => (
                <button
                  key={month.monthLabel}
                  type="button"
                  onClick={() => setSelectedMonthIndex(index)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    index === selectedMonthIndex
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {month.monthLabel}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No months available.</div>
          )}
        </div>
      </div>

      {months.length === 0 ? (
        <EmptyCalendarState />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Selected month events */}
          <div className="xl:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">
                  {selectedMonth?.monthLabel} Events
                </h2>
                <div className="text-sm text-gray-400">
                  {selectedMonth?.events.length ?? 0} event
                  {(selectedMonth?.events.length ?? 0) === 1 ? "" : "s"}
                </div>
              </div>

              <div className="space-y-4 p-5">
                {selectedMonth?.events.length ? (
                  selectedMonth.events.map((event, index) => (
                    <EventCard
                      key={event.event_id || `${event.title}-${event.start_date}-${index}`}
                      event={event}
                    />
                  ))
                ) : (
                  <div className="rounded-xl bg-gray-50 p-8 text-center text-sm text-gray-500">
                    No events in this month.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar summary */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">Upcoming Events</h2>
              </div>

              <div className="space-y-3 p-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event, index) => (
                    <EventCard
                      key={event.event_id || `${event.title}-${event.start_date}-${index}`}
                      event={event}
                    />
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No upcoming events.</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">Calendar Insights</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4">
                <div className="rounded-xl bg-blue-50 p-4">
                  <div className="text-xs text-blue-600">Busy Months</div>
                  <div className="mt-1 text-lg font-semibold text-blue-900">{months.length}</div>
                </div>
                <div className="rounded-xl bg-green-50 p-4">
                  <div className="text-xs text-green-600">Upcoming</div>
                  <div className="mt-1 text-lg font-semibold text-green-900">
                    {upcomingEvents.length}
                  </div>
                </div>
                <div className="rounded-xl bg-purple-50 p-4">
                  <div className="text-xs text-purple-600">Selected Month</div>
                  <div className="mt-1 text-lg font-semibold text-purple-900">
                    {selectedMonth?.events.length ?? 0}
                  </div>
                </div>
                <div className="rounded-xl bg-orange-50 p-4">
                  <div className="text-xs text-orange-600">All Day Events</div>
                  <div className="mt-1 text-lg font-semibold text-orange-900">{allDayCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}