import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Weight from "./pages/Weight";
import Register from "./pages/Register";
import Login from "./pages/Login";
import TrainerHome from "./pages/TrainerHome";
import ProtectedRoute from "./components/ProtectedRoute";

function RoleHome() {
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  return stored.role === "trainer" ? <TrainerHome /> : <Dashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><RoleHome /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/weight" element={<ProtectedRoute><Weight /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;