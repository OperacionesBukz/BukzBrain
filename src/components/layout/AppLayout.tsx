import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Library, ClipboardList, HelpCircle, Menu, Home as HomeIcon, LogOut, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo-bukz.png";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NavItem {
  label: string;
  icon: React.ElementType;
  id: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Home", icon: HomeIcon, id: "home", path: "/" },
  { label: "Operaciones", icon: ClipboardList, id: "operaciones", path: "/operaciones" },
  { label: "Librerías", icon: Library, id: "librerias", path: "/librerias" },
  { label: "Solicitudes", icon: FileText, id: "solicitudes", path: "/solicitudes" }, // NUEVO
];

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false); // NUEVO
  const [username, setUsername] = useState(""); // NUEVO
  const navigate = useNavigate();
  const location = useLocation();

  // NUEVO: Cargar username del localStorage
  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) {
      setUsername(user);
    }
  }, []);

  // Determine page title based on current path
  const getPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath === "/") return { title: "Bukz Brain", subtitle: "Sistema de Documentación Interna" };
    if (currentPath.includes("/operaciones")) return { title: "Operaciones", subtitle: "Guías y procedimientos para gestión operativa" };
    if (currentPath.includes("/librerias")) return { title: "Biblioteca de Documentos", subtitle: "Descarga formatos, guías e instructivos oficiales" };
    if (currentPath.includes("/solicitudes")) return { title: "Solicitudes", subtitle: "Gestiona tus solicitudes de vacaciones y permisos" }; // NUEVO
    return { title: "Bukz Brain", subtitle: "Sistema de Documentación Interna" };
  };

  const { title, subtitle } = getPageTitle();

  const sidebarWidth = 257;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed Header - Shopify Style */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-yellow-600 h-16">
        <div className="h-full flex items-center px-4 gap-4">
          {/* Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-foreground hover:bg-foreground/10 flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo - AHORA CLICKEABLE */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <img 
              src={logoImage} 
              alt="Bukz Logo" 
              className="h-8 w-auto object-contain"
            />
          </button>

          {/* Vertical Separator */}
          <div className="h-8 w-px bg-foreground/20" />

          {/* Page Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
            <p className="text-xs text-foreground/70 truncate hidden sm:block">{subtitle}</p>
          </div>

          {/* NUEVO: Usuario en header */}
          {username && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/10 rounded-lg">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-accent-foreground text-sm font-semibold">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:inline">{username}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex pt-16 flex-1">
        {/* Collapsible Sidebar */}
        <aside 
          className={cn(
            "fixed left-0 top-16 bottom-0 z-40 bg-sidebar transition-all duration-300"
          )}
          style={{
            width: sidebarCollapsed ? '64px' : `${sidebarWidth}px`,
            borderRight: "1px solid hsl(var(--sidebar-border))"
          }}
        >
          <div className="flex h-full flex-col">
            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      sidebarCollapsed && "justify-center px-2",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 font-medium"
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && item.label}
                  </button>
                );
              })}
            </nav>

            {/* Help and Logout section at bottom */}
            <div className="border-t border-sidebar-border p-2 space-y-1">
              {/* ACTUALIZADO: Ayuda con pop-up */}
              <button
                onClick={() => setShowHelpDialog(true)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50",
                  sidebarCollapsed && "justify-center px-2"
                )}
                title={sidebarCollapsed ? "Ayuda y Soporte" : undefined}
              >
                <HelpCircle className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && "Ayuda y Soporte"}
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("isAuthenticated");
                  localStorage.removeItem("userRole");
                  localStorage.removeItem("username");
                  navigate("/login");
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50",
                  sidebarCollapsed && "justify-center px-2"
                )}
                title={sidebarCollapsed ? "Cerrar Sesión" : undefined}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && "Cerrar Sesión"}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main 
          className="flex-1 transition-all duration-300"
          style={{
            marginLeft: sidebarCollapsed ? '64px' : `${sidebarWidth}px`
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* NUEVO: Dialog de Ayuda */}
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