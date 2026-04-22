import { useEffect, useMemo, useState } from "react";
import { userID } from "../../App";
import AddScheduleModal from "../app-shell/AddScheduleModal";
import EditScheduleModal from "../app-shell/EditScheduleModal";
import { APP_EVENT_SCHEDULE_CREATED } from "../../lib/app-events";

type CalendarEvent = {
  event_id?: string;
  title: string;
  start_date: string;
  end_date?: string | null;
  description?: string | null;
  start_time?: string | null;
  end_time?: string | null;
};

type MonthSection = {
  monthLabel: string;
  events: CalendarEvent[];
};

const monthNames = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

function parseDateOnlyLocal(rawDate: string): Date | null {
  const dateMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!dateMatch) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  return new Date(year, month - 1, day);
}

function getEventStartDateTime(event: CalendarEvent): Date | null {
  const baseDate = parseDateOnlyLocal(event.start_date);
  if (!baseDate) return null;

  const timeMatch = event.start_time?.match(/^(\d{2}):(\d{2})/);
  if (!timeMatch) {
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, 0, 0, 0);
  }

  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hour, minute, 0, 0);
}

function formatFullDate(date: string) {
  const parsedLocal = parseDateOnlyLocal(date);
  if (!parsedLocal || Number.isNaN(parsedLocal.getTime())) return date;

  return parsedLocal.toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function EventCard({
  event,
  showActions = false,
  onEdit,
  onDelete,
}: {
  event: CalendarEvent;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="mt-1 h-12 w-1 rounded-full bg-blue-500" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-gray-900">{event.title}</div>
            <div className="mt-1 text-sm text-gray-500">{formatFullDate(event.start_date)}</div>
            <div className="mt-1 text-xs text-gray-400">
              {formatTime(event.start_time)} {event.end_time ? `- ${formatTime(event.end_time)}` : ""}
            </div>
          </div>
        </div>
        {showActions ? (
          <div className="ml-3 flex items-center gap-2">
            <button
              type="button"
              aria-label="Edit event"
              onClick={onEdit}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Delete event"
              onClick={onDelete}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition-colors hover:border-red-300 hover:text-red-600"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </button>
          </div>
        ) : null}
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
  const [isEditScheduleModalOpen, setIsEditScheduleModalOpen] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<CalendarEvent | null>(null);

  const fetchCalendar = async () => {
    try {
      const res = await fetch(`/api/calendar?userID=${userID}`);
      const data = await res.json();

      const normalizedCalendar: MonthSection[] = Array.isArray(data?.Calendar)
        ? data.Calendar.map((month: any) => ({
            monthLabel: (() => {
              const year = month?.year ?? "";
              const monthNameFromApi = month?.month_name ?? month?.name;
              const monthFromNumber =
                typeof month?.number === "number" && month.number >= 1 && month.number <= 12
                  ? monthNames[month.number]
                  : "";
              const monthName = monthNameFromApi || monthFromNumber || "Unknown";
              return `${monthName} ${year}`.trim();
            })(),
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

const handleScheduleAdded = (newSchedule: {
  title: string;
  start_date: string;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  id: string;
}) => {
  const parsedStart = parseDateOnlyLocal(newSchedule.start_date);
  const labelSource = !parsedStart || Number.isNaN(parsedStart.getTime()) ? new Date() : parsedStart;
  const monthLabel = `${labelSource.toLocaleString("en-US", { month: "long" })} ${labelSource.getFullYear()}`;

  const newEvent = {
    event_id: newSchedule.id,
    title: newSchedule.title,
    start_date: newSchedule.start_date,
    start_time: newSchedule.start_time || null,
    end_time: newSchedule.end_time || null,
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

  const handleDeleteEvent = async (event: CalendarEvent) => {
    if (!event.event_id) return;

    try {
      const response = await fetch(
        `/api/delete_event?userID=${userID}&event_id=${encodeURIComponent(event.event_id)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      await fetchCalendar();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEventForEdit(event);
    setIsEditScheduleModalOpen(true);
  };

  const handleScheduleEdited = async () => {
    setIsEditScheduleModalOpen(false);
    setSelectedEventForEdit(null);
    await fetchCalendar();
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  useEffect(() => {
    const handleScheduleCreated = () => {
      fetchCalendar();
    };

    window.addEventListener(APP_EVENT_SCHEDULE_CREATED, handleScheduleCreated);
    return () => {
      window.removeEventListener(APP_EVENT_SCHEDULE_CREATED, handleScheduleCreated);
    };
  }, []);

  const selectedMonth = months[selectedMonthIndex];

  const allEvents = useMemo(() => {
    return months.flatMap((month) => month.events);
  }, [months]);

  const todayInputDate = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const upcomingEventList = useMemo(() => {
    const now = new Date();

    const getEventStartDateTime = (event: CalendarEvent): Date | null => {
      const eventDate = event.start_date?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
      if (!eventDate) return null;

      const timeMatch = event.start_time?.match(/^(\d{2}):(\d{2})/);
      if (timeMatch) {
        const year = Number(eventDate.slice(0, 4));
        const month = Number(eventDate.slice(5, 7));
        const day = Number(eventDate.slice(8, 10));
        const hour = Number(timeMatch[1]);
        const minute = Number(timeMatch[2]);
        return new Date(year, month - 1, day, hour, minute, 0, 0);
      }

      const year = Number(eventDate.slice(0, 4));
      const month = Number(eventDate.slice(5, 7));
      const day = Number(eventDate.slice(8, 10));
      return new Date(year, month - 1, day, 0, 0, 0, 0);
    };

    return allEvents
      .filter((event) => {
        const eventDate = event.start_date?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
        if (!eventDate) return false;

        if (!event.start_time) {
          return eventDate >= todayInputDate;
        }

        const startDateTime = getEventStartDateTime(event);
        return startDateTime ? startDateTime.getTime() >= now.getTime() : false;
      })
      .sort((a, b) => {
        const dateA = getEventStartDateTime(a);
        const dateB = getEventStartDateTime(b);
        const timestampA = dateA ? dateA.getTime() : Number.MAX_SAFE_INTEGER;
        const timestampB = dateB ? dateB.getTime() : Number.MAX_SAFE_INTEGER;
        return timestampA - timestampB;
      });
  }, [allEvents]);

  const totalEvents = allEvents.length;
  const allDayCount = allEvents.filter((e) => !e.start_time).length;
  const averageEventsPerMonth = months.length > 0 ? totalEvents / months.length : 0;
  const busyMonthCount = months.filter((month) => month.events.length > averageEventsPerMonth).length;
  const upcomingCount = upcomingEventList.length;

  const selectedMonthEvents = useMemo(() => {
    const now = new Date();
    const upcoming: CalendarEvent[] = [];
    const past: CalendarEvent[] = [];

    const events = [...(selectedMonth?.events ?? [])];
    events.forEach((event) => {
      const startDateOnly = event.start_date?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
      if (!startDateOnly) {
        past.push(event);
        return;
      }

      if (!event.start_time) {
        if (startDateOnly >= todayInputDate) {
          upcoming.push(event);
        } else {
          past.push(event);
        }
        return;
      }

      const startDateTime = getEventStartDateTime(event);
      if (!startDateTime) {
        past.push(event);
        return;
      }

      if (startDateTime.getTime() >= now.getTime()) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });

    upcoming.sort((a, b) => {
      const aTime = getEventStartDateTime(a)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bTime = getEventStartDateTime(b)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

    past.sort((a, b) => {
      const aTime = getEventStartDateTime(a)?.getTime() ?? Number.MIN_SAFE_INTEGER;
      const bTime = getEventStartDateTime(b)?.getTime() ?? Number.MIN_SAFE_INTEGER;
      return bTime - aTime;
    });

    return { upcoming, past };
  }, [selectedMonth, todayInputDate]);
  

  return (
    <div className="space-y-6">
      <AddScheduleModal
        isOpen={isAddScheduleModalOpen}
        onClose={() => setIsAddScheduleModalOpen(false)}
        userID={userID}
        onScheduleAdded={handleScheduleAdded}
      />
      <EditScheduleModal
        isOpen={isEditScheduleModalOpen}
        onClose={() => {
          setIsEditScheduleModalOpen(false);
          setSelectedEventForEdit(null);
        }}
        userID={userID}
        event={selectedEventForEdit}
        onScheduleEdited={handleScheduleEdited}
      />
      {/* Month Navigator */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-6 border-b px-5 py-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Calendar</h1>

          <div className="flex flex-1 items-center justify-between rounded-xl border border-gray-200 px-3 py-2">
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
                  <>
                    {selectedMonthEvents.upcoming.map((event, index) => (
                      <EventCard
                        key={event.event_id || `${event.title}-${event.start_date}-upcoming-${index}`}
                        event={event}
                        showActions
                        onEdit={() => handleEditEvent(event)}
                        onDelete={() => handleDeleteEvent(event)}
                      />
                    ))}

                    {selectedMonthEvents.upcoming.length > 0 && selectedMonthEvents.past.length > 0 ? (
                      <div className="flex items-center gap-3 py-1">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Past Events
                        </span>
                        <div className="h-px flex-1 bg-gray-200" />
                      </div>
                    ) : null}

                    {selectedMonthEvents.past.map((event, index) => (
                      <EventCard
                        key={event.event_id || `${event.title}-${event.start_date}-past-${index}`}
                        event={event}
                        showActions
                        onEdit={() => handleEditEvent(event)}
                        onDelete={() => handleDeleteEvent(event)}
                      />
                    ))}
                  </>
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
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">Calendar Insights</h2>
                <button
                  onClick={() => setIsAddScheduleModalOpen(true)}
                  className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white"
                >
                  Add Event
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4">
                <div className="rounded-xl bg-blue-50 p-4">
                  <div className="text-xs text-blue-600">Busy Months</div>
                  <div className="mt-1 text-lg font-semibold text-blue-900">{busyMonthCount}</div>
                </div>
                <div className="rounded-xl bg-green-50 p-4">
                  <div className="text-xs text-green-600">Upcoming</div>
                  <div className="mt-1 text-lg font-semibold text-green-900">
                    {upcomingCount}
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

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">Upcoming Events</h2>
              </div>

              <div className="space-y-3 p-4">
                {upcomingEventList.length > 0 ? (
                  <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
                    {upcomingEventList.map((event, index) => (
                      <EventCard
                        key={event.event_id || `${event.title}-${event.start_date}-${index}`}
                        event={event}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No upcoming events.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
