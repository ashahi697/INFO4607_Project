type Task = {
  title: string;
  completedDate?: string;
};

type TaskCompletionModalProps = {
  isOpen: boolean;
  selectedTask: Task | null;
  taskCompletionDate: string;
  isTaskActionLoading: boolean;
  onTaskCompletionDateChange: (nextDate: string) => void;
  onClose: () => void;
  onMarkComplete: () => void;
  onMarkIncomplete: () => void;
};

export default function TaskCompletionModal({
  isOpen,
  selectedTask,
  taskCompletionDate,
  isTaskActionLoading,
  onTaskCompletionDateChange,
  onClose,
  onMarkComplete,
  onMarkIncomplete,
}: TaskCompletionModalProps) {
  if (!isOpen || !selectedTask) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-xl border bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="font-medium">Task Completion</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close task completion modal"
            className="text-gray-500 transition-colors hover:text-gray-700"
            disabled={isTaskActionLoading}
          >
            X
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="text-sm text-gray-600">{selectedTask.title}</div>

          {selectedTask.completedDate ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                This task is already completed. You can update the completion date or mark it incomplete.
              </p>
              <label className="block space-y-1">
                <span className="text-sm text-gray-600">Completion Date</span>
                <input
                  type="date"
                  value={taskCompletionDate}
                  onChange={(e) => onTaskCompletionDateChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-500"
                />
              </label>
              <div className="flex items-center justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={onMarkIncomplete}
                  disabled={isTaskActionLoading}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:text-gray-800 disabled:opacity-60"
                >
                  Mark Incomplete
                </button>
                <button
                  type="button"
                  onClick={onMarkComplete}
                  disabled={isTaskActionLoading || !taskCompletionDate}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700 disabled:opacity-60"
                >
                  Save Completion Date
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block space-y-1">
                <span className="text-sm text-gray-600">Completion Date</span>
                <input
                  type="date"
                  value={taskCompletionDate}
                  onChange={(e) => onTaskCompletionDateChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-500"
                />
              </label>
              <div className="flex items-center justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isTaskActionLoading}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:text-gray-800 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onMarkComplete}
                  disabled={isTaskActionLoading || !taskCompletionDate}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700 disabled:opacity-60"
                >
                  Mark Complete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
