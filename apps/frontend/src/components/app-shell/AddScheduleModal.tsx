import React from "react";

type ScheduleItem = {
  title: string;
  day: string;
  time: string;
  id: string;
};

type AddScheduleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userID: string;
  onScheduleAdded: (item: ScheduleItem) => void;
};

export default function AddScheduleModal({
  isOpen,
  onClose,
  userID,
  onScheduleAdded,
}: AddScheduleModalProps) {
  const [title, setTitle] = React.useState("");
  const [day, setDay] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [note, setNote] = React.useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/create_schedule_item?userID=${userID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          day,
          start_time: startTime,
          end_time: endTime,
          note,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add schedule item");
      }

      const responseData = await response.json();
      const createdSchedule = Array.isArray(responseData?.message)
        ? responseData.message[0]
        : responseData?.message;

      const createdId = createdSchedule?.schedule_id;

      if (!createdId) {
        throw new Error("Missing schedule_id in create_schedule_item response");
      }

      const newScheduleItem = {
        title,
        day,
        time: `${startTime} – ${endTime}`,
        id: createdId,
      };

      onScheduleAdded(newScheduleItem);
      onClose();

      setTitle("");
      setDay("");
      setStartTime("");
      setEndTime("");
      setNote("");
    } catch (error) {
      console.error("Error adding schedule item:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-xl border bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="font-medium">Add Schedule Item</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add schedule modal"
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
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-gray-600">Day</span>
            <input
              type="text"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              placeholder="Monday"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-500"
            />
          </label>

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
              <span className="text-sm text-gray-600">End Time</span>
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
              Add Schedule Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
