import React from "react";

type Transaction = { title: string; date: string; amount: string };
type TransactionWithId = Transaction & { id: string };

type EditTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userID: string;
  transaction: TransactionWithId | null;
  onTransactionEdited: (transaction: TransactionWithId) => void;
};

export default function EditTransactionModal({
  isOpen,
  onClose,
  userID,
  transaction,
  onTransactionEdited,
}: EditTransactionModalProps) {
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState("");
  const [merchant, setMerchant] = React.useState("");
  const [type, setType] = React.useState("expense");
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (!isOpen || !transaction) return;

    const numericAmount = transaction.amount.replace(/[^\d.]/g, "");
    const isIncome = transaction.amount.trim().startsWith("+");

    setAmount(numericAmount);
    setDate(transaction.date);
    setMerchant(transaction.title);
    setType(isIncome ? "income" : "expense");
    setNote("");
  }, [isOpen, transaction]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    try {
      const transactionData = {
        amount: Number(amount || 0),
        txn_date: date,
        merchant: merchant || "Unknown Transaction",
        note,
        positive: type === "income",
      };

      const response = await fetch(`/api/edit_transaction?userID=${userID}&transaction_id=${transaction.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        throw new Error("Failed to edit transaction");
      }

      const editedTransaction = {
        id: transaction.id,
        title: merchant || "Unknown Transaction",
        date,
        amount: `${type === "income" ? "+" : "-"}$${Number(amount || 0).toFixed(2)}`,
      };

      onTransactionEdited(editedTransaction);
      onClose();
    } catch (error) {
      console.error("Error editing transaction:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-xl border bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="font-medium">Edit Transaction</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit transaction modal"
            className="text-gray-500 transition-colors hover:text-gray-700"
          >
            X
          </button>
        </div>

        <form
          className="space-y-4 p-5"
          onSubmit={handleSubmit}
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
