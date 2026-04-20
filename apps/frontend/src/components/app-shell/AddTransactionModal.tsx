import React from "react";
type AddTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userID: string;
  onTransactionAdded: (transaction: Transaction) => void;
};

type Transaction = { title: string; date: string; amount: string; id: string };

export default function AddTransactionModal({ isOpen, onClose, userID, onTransactionAdded }: AddTransactionModalProps) {
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState("");
  const [merchant, setMerchant] = React.useState("");
  const [type, setType] = React.useState("expense");
  const [note, setNote] = React.useState("");
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await fetch(`/api/create_transaction?userID=${userID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Number(amount),
        txn_date: date,
        merchant,
        note,
        positive: type === "income",
      }),
    });

    const responseData = await response.json();

    const createdTransaction = Array.isArray(responseData?.message)
      ? responseData.message[0]
      : responseData?.message;

    const createdId =
      createdTransaction?.txn_id ||
      createdTransaction?.id ||
      Date.now().toString();

    const newTransaction = {
      title: merchant || "Unknown Transaction",
      date,
      amount: `${type === "income" ? "+" : "-"}$${Number(amount).toFixed(2)}`,
      id: createdId,
    };

    onTransactionAdded(newTransaction);
    onClose();

    setAmount("");
    setDate("");
    setMerchant("");
    setType("expense");
    setNote("");
  } catch (error) {
    console.error("Error adding transaction:", error);

    const newTransaction = {
      title: merchant || "Unknown Transaction",
      date,
      amount: `${type === "income" ? "+" : "-"}$${Number(amount).toFixed(2)}`,
      id: Date.now().toString(),
    };

    onTransactionAdded(newTransaction);
    onClose();

    setAmount("");
    setDate("");
    setMerchant("");
    setType("expense");
    setNote("");
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-xl border bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="font-medium">Add Transaction</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add transaction modal"
            className="text-gray-500 transition-colors hover:text-gray-700"
          >
            X
          </button>
        </div>

        <form
          className="space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm text-gray-600">Amount</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-500"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-gray-600">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-500"
              />
            </label>
          </div>

          <label className="space-y-1 block">
            <span className="text-sm text-gray-600">Merchant</span>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="Merchant name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-500"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm text-gray-600">Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-gray-500"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
          </div>

          <label className="space-y-1 block">
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
              onClick={handleSubmit}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
