import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/Home";
import Operaciones from "./pages/Operaciones";
import Librerias from "./pages/Librerias";
import VacacionesPermisos from "./pages/VacacionesPermisos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          {/* Rutas con el layout principal (header + sidebar) */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/operaciones" element={<Operaciones />} />
            <Route path="/librerias" element={<Librerias />} />
          </Route>

          {/* Rutas sin layout (página completa) */}
          <Route path="/vacaciones-permisos" element={<VacacionesPermisos />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;