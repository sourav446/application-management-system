import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/common/AppShell";
import InitialTourModal from "./components/common/InitialTourModal";
import Dashboard from "./pages/Dashboard";
import Applicants from "./pages/Applicants";
import Programs from "./pages/Programs";
import Admission from "./pages/Admission";

function App() {
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    const initialTourValue = window.localStorage.getItem("initialTour");

    if (initialTourValue !== "false") {
      window.localStorage.setItem("initialTour", "true");
      setIsTourOpen(true);
    }
  }, []);

  const handleTourClose = () => {
    window.localStorage.setItem("initialTour", "false");
    setIsTourOpen(false);
  };

  return (
    <>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applicants" element={<Applicants />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/admissions" element={<Admission />} />
        </Routes>
      </AppShell>

      <InitialTourModal isOpen={isTourOpen} onClose={handleTourClose} />
    </>
  );
}

export default App;
