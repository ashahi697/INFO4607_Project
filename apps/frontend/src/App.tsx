import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/app-shell/Sidebar";
import Topbar from "./components/app-shell/Topbar";
import Dashboard from "./components/dashboard/DashboardPage";
import Financial from "./components/pages/financial";
import Productivity from "./components/pages/productivity";
import Calendar from "./components/pages/calendar";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#f5f6f8] text-gray-900">
        <Sidebar />
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
