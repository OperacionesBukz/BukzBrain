import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import logoImage from "@/assets/logo-bukz.png";

// Códigos de acceso (en un proyecto real, estos deberían estar en el backend)
const CODES = {
  ADMIN: "BUKZ2026*", // Código maestro
  EMPLOYEE: "EQUIPO2026*", // Código empleado
};

const Login = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simular un pequeño delay para dar feedback visual
    setTimeout(() => {
      const upperCode = code.toUpperCase().trim();

      if (upperCode === CODES.ADMIN) {
        // Guardar sesión como admin
        localStorage.setItem("bukz_auth", JSON.stringify({
          role: "admin",
          timestamp: Date.now(),
        }));
        navigate("/");
      } else if (upperCode === CODES.EMPLOYEE) {
        // Guardar sesión como empleado
        localStorage.setItem("bukz_auth", JSON.stringify({
          role: "employee",
          timestamp: Date.now(),
        }));
        navigate("/");
      } else {
        setError("Código incorrecto. Por favor, verifica e intenta nuevamente.");
      }

      setIsLoading(false);
    }, 500);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-6 pb-2">
          {/* Logo de la empresa */}
          <div className="flex justify-center">
            <img 
              src={logoImage} 
              alt="Bukz Logo" 
              className="h-24 w-auto object-contain"
            />
          </div>
          
          {/* Título y subtítulo */}
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-foreground">
              Bukz Brain
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Ingresa tu código de acceso para continuar
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de código con toggle de visibilidad */}
            <div className="space-y-2">
              <label 
                htmlFor="access-code" 
                className="text-sm font-medium text-foreground"
              >
                Código de Acceso
              </label>
              <div className="relative">
                <Input
                  id="access-code"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-center text-lg tracking-wider uppercase pr-10"
                  maxLength={20}
                  autoFocus
                  autoComplete="off"
                />
                {/* Botón de toggle visibilidad */}
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md p-1"
                  aria-label={showPassword ? "Ocultar código" : "Mostrar código"}
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
              disabled={isLoading || !code}
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
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Si no tienes un código de acceso, contacta al administrador del sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;