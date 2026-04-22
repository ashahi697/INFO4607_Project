import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/app-shell/Sidebar";
import Topbar from "./components/app-shell/Topbar";
import Dashboard from "./components/dashboard/DashboardPage";
import Financial from "./components/pages/financial";
import Productivity from "./components/pages/productivity";
import Calendar from "./components/pages/calendar";
import {
  APP_EVENT_SCHEDULE_CREATED,
  APP_EVENT_TASK_CREATED,
  APP_EVENT_TRANSACTION_CREATED,
} from "./lib/app-events";

export const userID = "03d78572-f213-4584-b8b2-e1a34dd1c030";

function App() {
const handleAddTransaction = (newTransaction: {
  title: string;
  date: string;
  amount: string;
  id: string;
}) => {
  window.dispatchEvent(new CustomEvent(APP_EVENT_TRANSACTION_CREATED, { detail: newTransaction }));
};
const handleAddTask = async (newTask: any) => {
  window.dispatchEvent(new CustomEvent(APP_EVENT_TASK_CREATED, { detail: newTask }));
};

const handleAddSchedule = async (newSchedule: any) => {
  window.dispatchEvent(new CustomEvent(APP_EVENT_SCHEDULE_CREATED, { detail: newSchedule }));
};
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#f5f6f8] text-gray-900">
        <Sidebar
        userID={userID}
        onTransactionAdded={handleAddTransaction}
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
