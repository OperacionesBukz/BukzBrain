import { useState, useEffect } from "react";

interface AuthData {
  role: "admin" | "employee";
  timestamp: number;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "employee" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const authData = localStorage.getItem("bukz_auth");
      
      if (!authData) {
        setIsAuthenticated(false);
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      const parsed: AuthData = JSON.parse(authData);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

      // Verificar si la sesión sigue siendo válida (24 horas)
      if (now - parsed.timestamp < twentyFourHours) {
        setIsAuthenticated(true);
        setUserRole(parsed.role);
      } else {
        // Sesión expirada
        logout();
      }
    } catch (error) {
      console.error("Error al verificar autenticación:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("bukz_auth");
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return {
    isAuthenticated,
    userRole,
    isLoading,
    logout,
    checkAuth,
  };
};
