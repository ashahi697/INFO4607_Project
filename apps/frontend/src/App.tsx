import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/app-shell/Sidebar";
import Topbar from "./components/app-shell/Topbar";
import DashboardPage from "./components/dashboard/DashboardPage";
import FinancialPage from "./components/pages/FinancialPage";
import ProductivityPage from "./components/pages/ProductivityPage";
import CalendarPage from "./components/pages/CalendarPage";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#f5f6f8] text-gray-900">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-auto p-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/financial" element={<FinancialPage />} />
              <Route path="/productivity" element={<ProductivityPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
