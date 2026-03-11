export type DashboardData = {
  stats: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    tasksCompleted: number;
    tasksPending: number;
  };
  heatmap: { date: string; level: number }[];
  schedule: { title: string; start: string; end: string }[];
  transactions: { title: string; date: string; amount: number; category: string }[];
  tasks: { title: string; priority: string; due: string; completed: boolean }[];
};
