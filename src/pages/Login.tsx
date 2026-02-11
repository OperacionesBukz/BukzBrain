import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import logoImage from "@/assets/logo-bukz.png";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("[LOGIN] Llamando signIn...");
      const { error: signInError } = await signIn(email, password);
      console.log("[LOGIN] signIn retornó:", signInError);

      if (signInError) {
        setError(signInError);
        setIsLoading(false);
        return;
      }

      console.log("[LOGIN] Redirigiendo a home...");
      // Login exitoso - redirigir a home
      setTimeout(() => {
        navigate("/", { replace: true });
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error("[LOGIN] Error catch:", err);
      setError("Error al iniciar sesión. Por favor intenta de nuevo.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-[#161A15] border-[#161A15]">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <img
              src={logoImage}
              alt="Bukz Logo"
              className="h-16 w-auto object-contain"
            />
          </div>

        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white dark:bg-gray-100 text-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-600 border-gray-300 dark:border-gray-600"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white dark:bg-gray-100 text-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-600 border-gray-300 dark:border-gray-600 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-800 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded p-3">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-[#F7DC6F] hover:bg-[#F7DC6F]/90 text-black font-semibold"
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
