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

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [username, setUsername] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-sidebar border-r border-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo - clickeable para ir a home */}
        <div className="p-6 border-b border-border">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity w-full"
          >
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-accent-foreground font-bold text-xl">B</span>
            </div>
            {isSidebarOpen && (
              <span className="text-xl font-bold text-sidebar-foreground">BukzBrain</span>
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Toggle Sidebar */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full justify-center"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-end gap-4">
          {/* Botón de Ayuda */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHelpDialog(true)}
            className="text-muted-foreground hover:text-foreground"
            title="Ayuda y Soporte"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Usuario */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-lg">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-accent-foreground text-sm font-semibold">
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
            className="text-muted-foreground hover:text-foreground"
            title="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Dialog de Ayuda */}
      <AlertDialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Ayuda y Soporte
            </AlertDialogTitle>
            <AlertDialogDescription>
              Para cualquier ayuda o soporte técnico, por favor contacta a nuestro equipo de
              operaciones:
              <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                <p className="text-accent font-medium">
                  📧 operaciones@bukz.co
                </p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Nuestro equipo responderá a tu solicitud lo antes posible.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowHelpDialog(false)}>
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AppLayout;