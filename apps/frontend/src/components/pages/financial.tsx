import React from "react";

export default function FinancialPage() {
  const cards = [
    { label: "Monthly Budget", value: "$2,500" },
    { label: "Spent This Month", value: "$1,430" },
    { label: "Remaining", value: "$1,070" },
    { label: "Subscriptions", value: "4 Active" },
  ];

  const transactions = [
    { title: "Grocery Store", date: "Mar 22, 2026", amount: "-$84.21", category: "Food" },
    { title: "Paycheck", date: "Mar 20, 2026", amount: "+$850.00", category: "Income" },
    { title: "Gas", date: "Mar 19, 2026", amount: "-$42.00", category: "Transport" },
    { title: "Spotify", date: "Mar 18, 2026", amount: "-$10.99", category: "Subscription" },
  ];

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
        <div className="border-b px-5 py-3">
          <h2 className="font-medium text-gray-900">Recent Transactions</h2>
        </div>
        <div className="p-5 space-y-4">
          {transactions.map((t) => (
            <div key={`${t.title}-${t.date}`} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{t.title}</div>
                <div className="text-sm text-gray-500">
                  {t.date} • {t.category}
                </div>
              </div>
              <div className="font-medium text-gray-900">{t.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
