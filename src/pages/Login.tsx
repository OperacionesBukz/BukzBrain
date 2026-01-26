import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

// Códigos de acceso (en un proyecto real, estos deberían estar en el backend)
const CODES = {
  ADMIN: "BUKZ2025", // Código maestro
  EMPLOYEE: "EQUIPO2025", // Código empleado
};

const Login = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Lock className="h-8 w-8 text-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">Bukz Brain</CardTitle>
          <CardDescription className="text-base">
            Ingresa tu código de acceso para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Ingresa tu código"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-lg tracking-wider uppercase"
                maxLength={20}
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !code}
              variant="default"
            >
              {isLoading ? "Verificando..." : "Acceder"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
