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
        return fallbackUser;
      }

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        username: data.username,
        role: data.role || "employee",
      };
    } catch (err) {
      return fallbackUser;
    }
  };

  const handleUserSession = (supabaseUser: User) => {
    // NO usar await aqui — lanzar como fire-and-forget para no bloquear onAuthStateChange
    loadProfile(supabaseUser).then((profile) => {
      setUser(profile);
    });
  };

  useEffect(() => {
    let mounted = true;

    const timeout = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 5000);

    // Primero registrar el listener, luego obtener la sesion
    // Esto es lo recomendado por Supabase para evitar race conditions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;

        console.log("[AUTH] onAuthStateChange:", event);
        setSession(newSession);
        setLoading(false);

        if (newSession?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED")) {
          handleUserSession(newSession.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    // getSession dispara INITIAL_SESSION en el listener de arriba
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      // Si no hubo sesion, asegurarse de dejar de cargar
      if (!currentSession) {
        setLoading(false);
      }
    });

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
      console.log("[AUTH] Respuesta signIn:", { data: !!data, error: error?.message });

      if (error) {
        return { error: "Usuario o contraseña incorrectos" };
      }

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
