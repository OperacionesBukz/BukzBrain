import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Mientras carga la sesion, mostrar pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7DC6F] mx-auto mb-4"></div>
          <p className="text-sm text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si NO esta autenticado, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si esta autenticado, mostrar el contenido
  return <>{children}</>;
};

export default ProtectedRoute;
