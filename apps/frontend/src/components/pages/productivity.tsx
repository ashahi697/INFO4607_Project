import { useEffect, useState } from "react";
<<<<<<< HEAD
import AddTaskModal from  "../app-shell/AddTaskModal";
import { userID } from "../../App";

export default function ProductivityPage() {
  type Task = {
    task_id?: string;
    title: string;
    priority: string;
    due: string;
    completed: boolean;
    id?: string;
  };
=======
import { userID } from "../../App";
import AddTaskModal from "../app-shell/AddTaskModal";
>>>>>>> cbadbef (Fix: AddScheduleModal + working add button for calendar)

type Task = {
  id: string;
  title: string;
  priority: string;
  due: string;
  completed: boolean;
};

export default function ProductivityPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/tasks?userID=${userID}`);
        const data = await res.json();

        const normalizedTasks: Task[] = Array.isArray(data?.tasks)
          ? data.tasks.map((task: any) => ({
              id: task.task_id || task.id || crypto.randomUUID(),
              title: task.title || "Untitled Task",
              priority: task.priority || "Medium",
              due: task.due_date || task.due || "",
              completed: !!task.completed,
            }))
          : [];

        setTasks(normalizedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  const handleTaskAdded = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const habits = [
    { label: "Focus Sessions", value: "12 this week" },
    { label: "Average Deep Work", value: "2.3 hrs/day" },
    { label: "Best Time", value: "9 AM – 12 PM" },
    { label: "Completion Rate", value: "72%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Productivity</h1>
          <p className="text-gray-500">
            View task progress, work patterns, and focus habits.
          </p>
        </div>

        <button
          onClick={() => setIsAddTaskModalOpen(true)}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
        >
          Add Task
        </button>
      </div>

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        userID={userID}
        onTaskAdded={handleTaskAdded}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {habits.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="text-sm text-gray-500">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold text-gray-900">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b px-5 py-3">
          <h2 className="font-medium text-gray-900">Task Overview</h2>
        </div>

        <div className="space-y-3 p-5">
          {tasks.length === 0 ? (
            <div className="text-sm text-gray-500">No tasks yet.</div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
              >
                <div>
                  <div
                    className={`font-medium ${
                      task.completed
                        ? "text-gray-400 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {task.title}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        task.priority === "High"
                          ? "bg-red-50 text-red-600"
                          : task.priority === "Medium"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {task.priority}
                    </span>

                    <span>Due: {task.due || "No due date"}</span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={task.completed}
                  readOnly
                  className="h-4 w-4"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}