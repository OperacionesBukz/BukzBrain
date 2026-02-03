import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/Home";
import Operaciones from "./pages/Operaciones";
import Librerias from "./pages/Librerias";
import Solicitudes from "./pages/Solicitudes";
import SolicitudVacaciones from "./pages/SolicitudVacaciones";
import SolicitudCumpleanos from "./pages/SolicitudCumpleanos";
import InstructivoCaja from "./pages/InstructivoCaja";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/BukzBrain">
        <Routes>
          {/* Ruta de Login (sin layout) */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas con el layout principal */}
          <Route 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/operaciones" element={<Operaciones />} />
            <Route path="/librerias" element={<Librerias />} />
            <Route path="/solicitudes" element={<Solicitudes />} />
          </Route>

          {/* Rutas de formularios de solicitudes (con layout) */}
          <Route 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/solicitudes/vacaciones" element={<SolicitudVacaciones />} />
            <Route path="/solicitudes/cumpleanos" element={<SolicitudCumpleanos />} />
          </Route>
          
          {/* Instructivo de Caja (con layout) */}
          <Route 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/librerias/instructivo-caja" element={<InstructivoCaja />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;