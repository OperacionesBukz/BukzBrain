import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/Home";
import Operaciones from "./pages/Operaciones";
import Librerias from "./pages/Librerias";
import Solicitudes from "./pages/Solicitudes";
import VacacionesPermisos from "./pages/VacacionesPermisos";
import SolicitudVacaciones from "./pages/SolicitudVacaciones";
import SolicitudCumpleanos from "./pages/SolicitudCumpleanos";
import InstructivoCaja from "./pages/InstructivoCaja";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
// NUEVO: Importar página de tareas personales
import MyTasks from "./pages/MyTasks";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
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
            {/* NUEVA RUTA: Panel de tareas personales (con navegación visible) */}
            <Route path="/my-tasks" element={<MyTasks />} />
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
            path="/solicitudes/vacaciones" 
            element={
              <ProtectedRoute>
                <SolicitudVacaciones />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/solicitudes/cumpleanos" 
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
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;