import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/Home";
import Operaciones from "./pages/Operaciones";
import Librerias from "./pages/Librerias";
import VacacionesPermisos from "./pages/VacacionesPermisos";
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
          </Route>

          {/* Rutas protegidas sin layout - Página principal de solicitudes */}
          <Route 
            path="/librerias/vacaciones-permisos" 
            element={
              <ProtectedRoute>
                <VacacionesPermisos />
              </ProtectedRoute>
            } 
          />

          {/* Rutas de formularios de solicitudes */}
          <Route 
            path="/librerias/solicitud/vacaciones" 
            element={
              <ProtectedRoute>
                <SolicitudVacaciones />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/librerias/solicitud/cumpleanos" 
            element={
              <ProtectedRoute>
                <SolicitudCumpleanos />
              </ProtectedRoute>
            } 
          />
          
          {/* Instructivo de Caja */}
          <Route 
            path="/librerias/instructivo-caja" 
            element={
              <ProtectedRoute>
                <InstructivoCaja />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;