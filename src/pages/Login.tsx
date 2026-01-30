import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import logoImage from "@/assets/logo-bukz.png";
import { supabase } from "@/lib/supabaseClient";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Buscar el usuario en Supabase
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.trim())
        .eq('password', password)
        .single();

      if (supabaseError || !data) {
        setError("Usuario o contraseña incorrectos. Por favor, verifica e intenta nuevamente.");
        setIsLoading(false);
        return;
      }

      // Guardar sesión
      localStorage.setItem("bukz_auth", JSON.stringify({
        role: data.role,
        username: data.username,
        timestamp: Date.now(),
      }));

      // Navegar al home
      navigate("/");
    } catch (err) {
      console.error("Error de autenticación:", err);
      setError("Ocurrió un error al iniciar sesión. Inténtalo de nuevo.");
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg" style={{ backgroundColor: '#F5F5F5' }}>
        <CardHeader className="text-center space-y-6 pb-2">
          {/* Logo de la empresa */}
          <div className="flex justify-center">
            <img 
              src={logoImage} 
              alt="Bukz Logo" 
              className="h-24 w-auto object-contain"
            />
          </div>
          
          {/* Solo subtítulo */}
          <CardDescription className="text-base text-muted-foreground">
            Ingresa tus credenciales para continuar
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo de usuario */}
            <div className="space-y-2">
              <label 
                htmlFor="username" 
                className="text-sm font-medium text-foreground"
              >
                Usuario
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white"
                autoFocus
                autoComplete="username"
              />
            </div>

            {/* Campo de contraseña con toggle de visibilidad */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="text-sm font-medium text-foreground"
              >
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 bg-white"
                  autoComplete="current-password"
                />
                {/* Botón de toggle visibilidad */}
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md p-1"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {/* Mensaje de error */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive flex-1">{error}</p>
                </div>
              )}
            </div>

            {/* Botón de acceso */}
            <Button
              type="submit"
              className="w-full text-base py-6"
              disabled={isLoading || !username || !password}
              variant="default"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                "Acceder"
              )}
            </Button>
          </form>

          {/* Información adicional */}
          <div className="mt-6 pt-6 border-t border-gray-300">
            <p className="text-xs text-center text-muted-foreground">
              Si no tienes credenciales de acceso, contacta al administrador del sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;