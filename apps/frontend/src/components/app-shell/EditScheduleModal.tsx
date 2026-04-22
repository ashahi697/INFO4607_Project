import React from "react";

type ScheduleEvent = {
  event_id?: string;
  title: string;
  start_date: string;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  description?: string | null;
};

type EditScheduleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userID: string;
  event: ScheduleEvent | null;
  onScheduleEdited: (event: ScheduleEvent) => void;
};

export default function EditScheduleModal({
  isOpen,
  onClose,
  userID,
  event,
  onScheduleEdited,
}: EditScheduleModalProps) {
  const [title, setTitle] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (!isOpen || !event) return;

    setTitle(event.title ?? "");
    setStartDate(event.start_date ?? "");
    setEndDate(event.end_date ?? "");
    setStartTime(event.start_time ?? "");
    setEndTime(event.end_time ?? "");
    setNote(event.description ?? "");
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event.event_id) return;

    try {
      if (!startDate) {
        throw new Error("Start date is required");
      }
      if (endDate && endDate < startDate) {
        throw new Error("End date cannot be before start date");
      }

      const response = await fetch(
        `/api/edit_event?userID=${userID}&event_id=${encodeURIComponent(event.event_id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description: note || "",
            start_time: startTime || null,
            end_time: endTime || null,
            start_date: startDate,
            end_date: endDate || null,
            recurrences: null,
            repeat_until: null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to edit schedule item");
      }

      onScheduleEdited({
        event_id: event.event_id,
        title,
        description: note || "",
        start_date: startDate,
        end_date: endDate || null,
        start_time: startTime || null,
        end_time: endTime || null,
      });
      onClose();
    } catch (error) {
      console.error("Error editing schedule item:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-xl border bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="font-medium">Edit Schedule Item</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit schedule modal"
            className="text-gray-500 transition-colors hover:text-gray-700"
          >
            X
          </button>
        </div>

        <form className="space-y-4 p-5" onSubmit={handleSubmit}>
          <label className="block space-y-1">
            <span className="text-sm text-gray-600">Event Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-500"
              required
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm text-gray-600">Start Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-500"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-gray-600">End Date (Optional)</span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-500"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm text-gray-600">Start Time</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-500"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-gray-600">End Time (Optional)</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-500"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-sm text-gray-600">Note</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Optional note"
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-500"
            />
          </label>

          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
