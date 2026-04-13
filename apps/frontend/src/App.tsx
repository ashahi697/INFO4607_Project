import "./App.css";
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/app-shell/Sidebar";
import Topbar from "./components/app-shell/Topbar";
import Dashboard from "./components/dashboard/DashboardPage";
import Financial from "./components/pages/financial";
import Productivity from "./components/pages/productivity";
import Calendar from "./components/pages/calendar";

export const userID = "03d78572-f213-4584-b8b2-e1a34dd1c030";

function App() {
  const [transactions, setTransactions] = useState([
  { title: "Amazon Purchase", date: "Jan 15, 2025", amount: "-$89.99", id: "1" },
]);
  const [tasks, setTasks] = useState([
  { title: "Prepare client presentation", priority: "Medium", due: "Jan 18, 2025", completed: false, id: "1" },
]);

const [scheduleItems, setScheduleItems] = useState([
  { title: "Team Meeting", day: "Monday", time: "9:00 AM – 10:00 AM", id: "1" },
]);
const handleAddTransaction = (newTransaction: {
  title: string;
  date: string;
  amount: string;
  id: string;
}) => {
  setTransactions((prev) => [newTransaction, ...prev]);
};
const handleAddTask = async (newTask: any) => {
  setTasks((prev) => [
    ...prev,
    { ...newTask, id: Date.now().toString(), completed: false }
  ]);
};

const handleAddSchedule = async (newSchedule: any) => {
  setScheduleItems((prev) => [
    ...prev,
    { ...newSchedule, id: Date.now().toString() }
  ]);
};
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#f5f6f8] text-gray-900">
        <Sidebar
        userID={userID}
        onTaskAdded={handleAddTask}
        onScheduleAdded={handleAddSchedule}
      />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/financial" element={<Financial />} />
              <Route path="/productivity" element={<Productivity />} />
              <Route path="/calendar" element={<Calendar />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
