import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
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
  const mountedRef = useRef(true);

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

  useEffect(() => {
    mountedRef.current = true;

    const timeout = setTimeout(() => {
      if (mountedRef.current && loading) {
        setLoading(false);
      }
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mountedRef.current) return;

        console.log("[AUTH] onAuthStateChange:", event);
        setSession(newSession);

        if (newSession?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED")) {
          // Cargar perfil y SOLO DESPUES poner loading=false
          loadProfile(newSession.user).then((profile) => {
            if (!mountedRef.current) return;
            setUser(profile);
            setLoading(false);
          });
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setLoading(false);
        } else {
          // Cualquier otro evento sin sesion
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mountedRef.current) return;
      if (!currentSession) {
        setLoading(false);
      }
      // Si hay sesion, INITIAL_SESSION del listener se encarga
    });

    return () => {
      mountedRef.current = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: "Usuario o contraseña incorrectos" };
      }

      return { error: null };
    } catch (err) {
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
