import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Verificar si hay una sesión de Bukz guardada
  const bukzAuth = localStorage.getItem("bukz_auth");
  
  // Si no hay sesión, redirigir al login
  if (!bukzAuth) {
    return <Navigate to="/login" replace />;
  }

  // Verificar que la sesión sea válida (JSON parseable)
  try {
    const auth = JSON.parse(bukzAuth);
    
    // Verificar que tenga un rol válido
    if (!auth.role || !auth.timestamp) {
      localStorage.removeItem("bukz_auth");
      return <Navigate to="/login" replace />;
    }
    
    // Opcional: Verificar expiración de sesión (24 horas)
    const now = Date.now();
    const hoursSinceLogin = (now - auth.timestamp) / (1000 * 60 * 60);
    
    if (hoursSinceLogin > 24) {
      localStorage.removeItem("bukz_auth");
      return <Navigate to="/login" replace />;
    }
    
  } catch (error) {
    // Si hay error al parsear, limpiar y redirigir
    localStorage.removeItem("bukz_auth");
    return <Navigate to="/login" replace />;
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
};

export default ProtectedRoute;
