import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, FileText, BookOpen, LogOut, HelpCircle, Menu as MenuIcon } from "lucide-react";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [username, setUsername] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Obtener el usuario del localStorage
    const user = localStorage.getItem("username");
    if (user) {
      setUsername(user);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const menuItems = [
    { icon: Home, label: "Inicio", path: "/" },
    { icon: FileText, label: "Operaciones", path: "/operaciones" },
    { icon: BookOpen, label: "Librerías", path: "/librerias" },
    { icon: FileText, label: "Solicitudes", path: "/solicitudes" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-primary sticky top-0 z-50">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo y menú mobile */}
            <div className="flex items-center gap-4">
              {/* Menú hamburguesa para móvil */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="text-foreground">
                    <MenuIcon className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 bg-primary">
                  <nav className="flex flex-col gap-2 mt-8">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive(item.path)
                              ? "bg-foreground/10 text-foreground"
                              : "text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>

              {/* Logo - clickeable para ir a home */}
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-accent-foreground font-bold text-lg">B</span>
                </div>
                <span className="text-xl font-bold text-foreground hidden sm:block">
                  BukzBrain
                </span>
              </button>
            </div>

            {/* Menú desktop */}
            <nav className="hidden lg:flex items-center gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? "bg-foreground/10 text-foreground"
                        : "text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Usuario y acciones */}
            <div className="flex items-center gap-2">
              {/* Botón de Ayuda */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHelpDialog(true)}
                className="text-foreground hover:bg-foreground/10"
                title="Ayuda y Soporte"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>

              {/* Usuario */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-foreground/10 rounded-lg">
                <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-accent-foreground text-xs font-semibold">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">{username}</span>
              </div>

              {/* Logout */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-foreground hover:bg-foreground/10"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Dialog de Ayuda */}
      <AlertDialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <AlertDialogContent className="bg-[#161A15] border-[#161A15]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Ayuda y Soporte
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Para cualquier ayuda o soporte técnico, por favor contacta a nuestro equipo de
              operaciones:
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-300 font-medium">
                  📧 operaciones@bukz.co
                </p>
              </div>
              <p className="mt-3 text-sm text-gray-400">
                Nuestro equipo responderá a tu solicitud lo antes posible.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowHelpDialog(false)}
              className="bg-accent hover:bg-accent/90"
            >
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AppLayout;