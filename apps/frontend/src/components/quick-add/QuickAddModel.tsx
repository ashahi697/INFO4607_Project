import React, { useState } from "react";

type QuickAddType = "transaction" | "task" | "schedule";

export default function QuickAddModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [selectedType, setSelectedType] = useState<QuickAddType>("transaction");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Add</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="border-b px-6 py-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType("transaction")}
              className={`rounded-lg px-3 py-2 text-sm ${
                selectedType === "transaction"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Transaction
            </button>

            <button
              onClick={() => setSelectedType("task")}
              className={`rounded-lg px-3 py-2 text-sm ${
                selectedType === "task"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Task
            </button>

            <button
              onClick={() => setSelectedType("schedule")}
              className={`rounded-lg px-3 py-2 text-sm ${
                selectedType === "schedule"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Schedule
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          {selectedType === "transaction" && (
            <form className="space-y-4">
              <input
                placeholder="Transaction title"
                className="w-full rounded-lg border px-3 py-2"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                className="w-full rounded-lg border px-3 py-2"
              />
              <input
                placeholder="Category"
                className="w-full rounded-lg border px-3 py-2"
              />
              <input
                type="date"
                className="w-full rounded-lg border px-3 py-2"
              />
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-gray-900 px-4 py-2 text-white"
              >
                Save Transaction
              </button>
            </form>
          )}

          {selectedType === "task" && (
            <form className="space-y-4">
              <input
                placeholder="Task title"
                className="w-full rounded-lg border px-3 py-2"
              />
              <select className="w-full rounded-lg border px-3 py-2">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <input
                type="date"
                className="w-full rounded-lg border px-3 py-2"
              />
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-gray-900 px-4 py-2 text-white"
              >
                Save Task
              </button>
            </form>
          )}

          {selectedType === "schedule" && (
            <form className="space-y-4">
              <input
                placeholder="Event title"
                className="w-full rounded-lg border px-3 py-2"
              />
              <input
                placeholder="Day"
                className="w-full rounded-lg border px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  className="w-full rounded-lg border px-3 py-2"
                />
                <input
                  type="time"
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-gray-900 px-4 py-2 text-white"
              >
                Save Schedule Item
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
