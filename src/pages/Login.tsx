import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Intentando login con:", username);
      
      // Buscar usuario en Supabase (case-insensitive)
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('*')
        .ilike('username', username)
        .single();

      console.log("Respuesta de Supabase:", { data, supabaseError });

      if (supabaseError) {
        console.error("Error de Supabase:", supabaseError);
        setError("Usuario o contraseña incorrectos");
        setIsLoading(false);
        return;
      }

      if (!data) {
        setError("Usuario no encontrado");
        setIsLoading(false);
        return;
      }

      // Verificar contraseña
      if (data.password === password) {
        // Guardar en localStorage
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", data.role || "employee");
        localStorage.setItem("username", data.username); // Guardar username
        
        console.log("Login exitoso, redirigiendo...");
        navigate("/");
      } else {
        setError("Usuario o contraseña incorrectos");
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError("Error al iniciar sesión. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-[#161A15] border-[#161A15]">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-2xl">B</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-white">
            BukzBrain
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Ingresa tus credenciales para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">
                Usuario
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-white"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white"
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded p-3">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;