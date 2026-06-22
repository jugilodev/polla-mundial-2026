import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Participant from "./pages/Participant";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/participant/:id" element={<Participant />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;