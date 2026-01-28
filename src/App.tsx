import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/Home";
import Operaciones from "./pages/Operaciones";
import Librerias from "./pages/Librerias";
import VacacionesPermisos from "./pages/VacacionesPermisos";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

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
          </Route>

          {/* Rutas protegidas sin layout */}
          <Route 
            path="/vacaciones-permisos" 
            element={
              <ProtectedRoute>
                <VacacionesPermisos />
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