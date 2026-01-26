import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Documents from "@/pages/Documents";
import Login from "@/pages/Login";

function App() {
  return (
    <BrowserRouter basename="/BukzBrain">
      <Routes>
        {/* Ruta pública de login */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas con Layout (sidebar) */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/operaciones" element={<Documents section="operaciones" />} />
          <Route path="/librerias" element={<Documents section="librerias" />} />
        </Route>

        {/* Redirigir cualquier otra ruta al home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;