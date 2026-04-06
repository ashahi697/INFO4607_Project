import { useEffect, useState } from "react";
import { userID } from "../../App";
import AddTransactionModal from "../app-shell/AddTransactionModal";
import EditTransactionModal from "../app-shell/EditTransactionModal";

export default function FinancialPage() {

  type Transaction = { title: string; date: string; amount: string; id: string };

  const cards = [
    { label: "Monthly Budget", value: "$2,500" },
    { label: "Spent This Month", value: "$1,430" },
    { label: "Remaining", value: "$1,070" },
    { label: "Subscriptions", value: "4 Active" },
  ];

  // const transactions = [
  //   { title: "Grocery Store", date: "Mar 22, 2026", amount: "-$84.21", category: "Food" },
  //   { title: "Paycheck", date: "Mar 20, 2026", amount: "+$850.00", category: "Income" },
  //   { title: "Gas", date: "Mar 19, 2026", amount: "-$42.00", category: "Transport" },
  //   { title: "Spotify", date: "Mar 18, 2026", amount: "-$10.99", category: "Subscription" },
  // ];

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isEditTransactionModalOpen, setIsEditTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
    try {
      const res = await fetch(`/api/get_transactions?userID=${userID}`);
      const data = await res.json();

      const formattedTransactions: Transaction[] = (data.transactions ?? []).map((t: any) => ({
        title: t.merchant ?? "Unknown Transaction",
        date: t.txn_date ?? "",
        amount: `${t.positive ? "+" : "-"}$${Number(t.amount ?? 0).toFixed(2)}`,
        id: t.txn_id,
      }));

      setTransactions(formattedTransactions);
      } catch (err) {
      console.error("Failed to fetch transactions:", err);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Financial</h1>
        <p className="text-gray-500">Track spending, budgets, and account activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">{card.label}</div>
            <div className="mt-2 text-2xl font-semibold text-gray-900">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="font-medium text-gray-900">Recent Transactions</h2>
          <button
            type="button"
            onClick={() => setIsAddTransactionModalOpen(true)}
            aria-label="Add transaction"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 pb-px text-base font-semibold leading-none text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
          >
            +
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-5 space-y-4">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{t.title}</div>
                <div className="text-sm text-gray-500">
                  {t.date}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-medium text-gray-900">{t.amount}</div>
                <button
                  type="button"
                  aria-label="Edit transaction"
                  onClick={() => {
                    setSelectedTransaction(t);
                    setIsEditTransactionModalOpen(true);
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Delete transaction"
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/delete_transaction?userID=${userID}&transaction_id=${t.id}`, {
                        method: "DELETE",
                      });

                      if (!response.ok) {
                        throw new Error("Failed to delete transaction");
                      }

                      setTransactions((prev) => prev.filter((transaction) => transaction.id !== t.id));
                    } catch (error) {
                      console.error("Error deleting transaction:", error);
                    }
                  }}
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
            </div>
          ))}
        </div>
      </div>

      <AddTransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
        userID={userID}
        onTransactionAdded={(newTransaction) => setTransactions((prev) => [newTransaction, ...prev])}
      />
      <EditTransactionModal
        isOpen={isEditTransactionModalOpen}
        onClose={() => {
          setIsEditTransactionModalOpen(false);
          setSelectedTransaction(null);
        }}
        userID={userID}
        transaction={selectedTransaction}
        onTransactionEdited={(editedTransaction) => {
          setTransactions((prev) =>
            prev.map((transaction) => (
              transaction.id === editedTransaction.id ? editedTransaction : transaction
            ))
          );
        }}
      />
    </div>
  );
}
