import React from "react";

type Task = {
  title: string;
  priority: string;
  due: string;
  completed: boolean;
  id: string;
};

type AddTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userID: string;
  onTaskAdded: (task: Task) => void;
};

export default function AddTaskModal({
  isOpen,
  onClose,
  userID,
  onTaskAdded,
}: AddTaskModalProps) {
  const [title, setTitle] = React.useState("");
  const [priority, setPriority] = React.useState("Medium");
  const [due, setDue] = React.useState("");
  const [note, setNote] = React.useState("");

  const getPriorityWeight = (rawPriority: string): number => {
    if (rawPriority === "High") return 5;
    if (rawPriority === "Medium") return 3;
    return 1;
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

    try {
      const response = await fetch(`/api/create_task?userID=${userID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task_name: title,
          priority_weight: getPriorityWeight(priority),
          created_at: due || new Date().toISOString().split("T")[0],
          completed_date: null,
          name: note || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

    const responseData = await response.json();

    const createdTask = Array.isArray(responseData?.message)
      ? responseData.message[0]
      : responseData?.message;

      const createdId = createdTask?.task_id ?? createdTask?.id;

      if (!createdId) {
        throw new Error("Missing task_id in create_task response");
      }

    const newTask = {
      title,
      priority,
      due,
      completed: false,
      id: createdId,
    };

    onTaskAdded(newTask);
    onClose();

    setTitle("");
    setPriority("Medium");
    setDue("");
    setNote("");
  } catch (error) {
    console.error("Error adding task:", error);

    // fallback so UI still works
    const newTask = {
      title,
      priority,
      due,
      completed: false,
      id: Date.now().toString(),
    };

    onTaskAdded(newTask);
    onClose();

    setTitle("");
    setPriority("Medium");
    setDue("");
    setNote("");
  }
};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-xl border bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="font-medium">Add Task</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add task modal"
            className="text-gray-500 transition-colors hover:text-gray-700"
          >
            X
          </button>
        </div>

        <form className="space-y-4 p-5" onSubmit={handleSubmit}>
          <label className="block space-y-1">
            <span className="text-sm text-gray-600">Task Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-500"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm text-gray-600">Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-gray-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm text-gray-600">Due Date</span>
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
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
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
