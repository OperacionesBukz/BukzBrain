import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Verificar autenticación en localStorage
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  
  console.log("ProtectedRoute check:", { isAuthenticated });
  
  // Si NO está autenticado, redirigir a login
  if (!isAuthenticated || isAuthenticated !== "true") {
    console.log("No autenticado, redirigiendo a login");
    return <Navigate to="/login" replace />;
  }
  
  console.log("Autenticado, mostrando contenido");
  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
};

export default ProtectedRoute;