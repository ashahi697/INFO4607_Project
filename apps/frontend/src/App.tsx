import "./App.css";
import Sidebar from "./components/app-shell/Sidebar";
import Topbar from "./components/app-shell/Topbar";
import DashboardPage from "./components/dashboard/DashboardPage";

function App() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar />
        <main style={{ flex: 1, overflow: "auto", background: "#f5f5f5", padding: "24px" }}>
          <DashboardPage />
        </main>
      </div>
    </div>
  );
}

export default App;
