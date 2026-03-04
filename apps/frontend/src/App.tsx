import "./App.css";
import AppShell from "./components/app-shell/AppShell";

function App() {
  return (
    <AppShell>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        Welcome back, John
      </h1>
      <p style={{ color: "#6b7280" }}>
        Dashboard scaffold is wired up. Next: cards + productivity heatmap.
      </p>
    </AppShell>
  );
}

export default App;
