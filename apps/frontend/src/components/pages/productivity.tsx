import { useEffect, useState } from "react";
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

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/tasks?userID=${userID}`);
        const data = await res.json();

        const normalizedTasks = Array.isArray(data?.tasks)
          ? data.tasks.map((task: any) => ({
              title: task.title,
              priority: task.priority,
              due: task.due_date || task.due,
              completed: !!task.completed,
              id: task.task_id || task.id,
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

  return (
    <div className="space-y-6">
      {/* HEADER + BUTTON */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Productivity</h1>

        <button
          onClick={() => setIsAddTaskModalOpen(true)}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
        >
          Add Task
        </button>
      </div>

      {/* MODAL */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        userID={userID}
        onTaskAdded={handleTaskAdded}
      />

      {/* TASK LIST (your existing UI below) */}
    </div>
  );
}
