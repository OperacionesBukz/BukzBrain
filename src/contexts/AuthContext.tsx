import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User, Session } from "@supabase/supabase-js";

interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar perfil del usuario desde la tabla profiles
  // Si la tabla no existe o no hay perfil, usa el email como fallback
  const loadProfile = async (supabaseUser: User): Promise<AuthUser> => {
    const fallbackUser: AuthUser = {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      username: supabaseUser.email?.split("@")[0] || "Usuario",
      role: "employee",
    };

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, role")
        .eq("id", supabaseUser.id)
        .single();

      if (error || !data) {
        // Tabla profiles no existe o usuario sin perfil - usar fallback
        return fallbackUser;
      }

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        username: data.username,
        role: data.role || "employee",
      };
    } catch (err) {
      // Error de red o tabla no existe - usar fallback
      return fallbackUser;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Timeout de seguridad: si getSession tarda mas de 5s, dejar de cargar
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 5000);

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          const profile = await loadProfile(currentSession.user);
          if (mounted) setUser(profile);
        }
      } catch (err) {
        console.error("Error al inicializar auth:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setLoading(false);

        if (event === "SIGNED_IN" && newSession?.user) {
          const profile = await loadProfile(newSession.user);
          if (mounted) setUser(profile);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      console.log("[AUTH] Intentando signIn con:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log("[AUTH] Respuesta signIn:", { data, error });

      if (error) {
        console.log("[AUTH] Error de Supabase:", error.message);
        return { error: "Usuario o contraseña incorrectos" };
      }

      console.log("[AUTH] Login exitoso, usuario:", data.user?.id);
      return { error: null };
    } catch (err) {
      console.error("[AUTH] Error catch:", err);
      return { error: "Error al iniciar sesión. Por favor intenta de nuevo." };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
