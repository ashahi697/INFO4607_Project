import { useEffect, useState } from "react";
import { userID } from "../../App";
import AddTransactionModal from "../app-shell/AddTransactionModal";
import EditTransactionModal from "../app-shell/EditTransactionModal";
import { APP_EVENT_TRANSACTION_CREATED } from "../../lib/app-events";

export default function FinancialPage() {

  type Transaction = { title: string; date: string; amount: string; id: string; note?: string };
  type BudgetSummary = { monthlyBudget: number; spentThisMonth: number; remaining: number };

  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>({
    monthlyBudget: 0,
    spentThisMonth: 0,
    remaining: 0,
  });

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
  const [selectedBudgetMonth, setSelectedBudgetMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const getMonthRange = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    return {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    };
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`/api/get_transactions?userID=${userID}`);
      const data = await res.json();

      const formattedTransactions: Transaction[] = (data.transactions ?? []).map((t: any) => ({
        title: t.merchant ?? "Unknown Transaction",
        date: t.txn_date ?? "",
        amount: `${t.positive ? "+" : "-"}$${Number(t.amount ?? 0).toFixed(2)}`,
        id: t.txn_id,
        note: t.note ?? "",
      }));

      setTransactions(formattedTransactions);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  const fetchBudgetSummary = async (monthDate: Date) => {
    const { start, end } = getMonthRange(monthDate);

    try {
      const [budgetRes, remainingRes] = await Promise.all([
        fetch(`/api/users/${userID}/budget`),
        fetch(`/api/users/${userID}/budget/remaining?start_date=${start}&end_date=${end}&view_type=month`),
      ]);

      const budgetData = budgetRes.ok ? await budgetRes.json() : null;
      const remainingData = remainingRes.ok ? await remainingRes.json() : null;

      const monthlyBudget = Number(
        budgetData?.budget?.planned_amount ?? remainingData?.remaining_budget?.planned_amount ?? 0
      );
      const spentThisMonth = Number(remainingData?.remaining_budget?.spent ?? 0);
      const incomeThisMonth = Number(remainingData?.remaining_budget?.income ?? 0);
      const remaining = monthlyBudget + incomeThisMonth - spentThisMonth;

      setBudgetSummary({
        monthlyBudget: Number.isNaN(monthlyBudget) ? 0 : monthlyBudget,
        spentThisMonth: Number.isNaN(spentThisMonth) ? 0 : spentThisMonth,
        remaining: Number.isNaN(remaining) ? 0 : remaining,
      });
    } catch (err) {
      console.error("Failed to fetch budget summary:", err);
      setBudgetSummary({ monthlyBudget: 0, spentThisMonth: 0, remaining: 0 });
    }
  };

  const cards = [
    { label: "Monthly Budget", value: `$${budgetSummary.monthlyBudget.toFixed(2)}` },
    { label: "Spent This Month", value: `$${budgetSummary.spentThisMonth.toFixed(2)}` },
    { label: "Remaining", value: `$${budgetSummary.remaining.toFixed(2)}` },
  ];

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    fetchBudgetSummary(selectedBudgetMonth);
  }, [selectedBudgetMonth]);

  useEffect(() => {
    const handleTransactionCreated = () => {
      fetchTransactions();
      fetchBudgetSummary(selectedBudgetMonth);
    };

    window.addEventListener(APP_EVENT_TRANSACTION_CREATED, handleTransactionCreated);
    return () => {
      window.removeEventListener(APP_EVENT_TRANSACTION_CREATED, handleTransactionCreated);
    };
  }, [selectedBudgetMonth]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Financial</h1>
        <p className="text-gray-500">Track spending, budgets, and account activity.</p>
      </div>

      <div className="grid grid-cols-3 items-center">
        <div>
          <button
            type="button"
            onClick={() => setSelectedBudgetMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
            aria-label="Previous budget month"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>
        <h2 className="text-center font-medium text-gray-900">
          {selectedBudgetMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedBudgetMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
            aria-label="Next budget month"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <div key={t.id} className="flex items-center gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{t.title}</div>
                    {t.note ? (
                      <>
                        <span className="text-gray-300">|</span>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{t.note}</div>
                      </>
                    ) : null}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t.date}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <div className={`font-medium ${t.amount.startsWith("+") ? "text-green-600" : "text-gray-900"}`}>
                  {t.amount}
                </div>
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
                      fetchBudgetSummary(selectedBudgetMonth);
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
        onTransactionAdded={(newTransaction) => {
          setTransactions((prev) => [newTransaction, ...prev]);
          fetchBudgetSummary(selectedBudgetMonth);
        }}
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
          fetchBudgetSummary(selectedBudgetMonth);
        }}
      />
    </div>
  );
}
