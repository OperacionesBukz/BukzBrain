import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, Library, ClipboardList, FileText, Menu, LogOut, HelpCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo-bukz.png";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SettingsModal } from "@/components/SettingsModal";
import { useAuth } from "@/contexts/AuthContext";

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const username = user?.username || "";

  const navItems = [
    { id: "home", label: "Inicio", icon: Home, path: "/" },
    { id: "operaciones", label: "Operaciones", icon: ClipboardList, path: "/operaciones" },
    { id: "librerias", label: "Biblioteca", icon: Library, path: "/librerias" },
    { id: "solicitudes", label: "Solicitudes", icon: FileText, path: "/solicitudes" },
  ];

  const getPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath === "/") return { title: "Bukz Brain", subtitle: "Sistema de Documentación Interna" };
    if (currentPath.includes("/operaciones")) return { title: "Operaciones", subtitle: "Guías y procedimientos para gestión operativa" };
    if (currentPath.includes("/librerias")) return { title: "Biblioteca de Documentos", subtitle: "Descarga formatos, guías e instructivos oficiales" };
    if (currentPath.includes("/solicitudes")) return { title: "Solicitudes", subtitle: "Gestiona tus solicitudes de vacaciones y permisos" };
    if (currentPath.includes("/my-tasks")) return { title: "Mis Tareas", subtitle: "Panel personal de organización" };
    return { title: "Bukz Brain", subtitle: "Sistema de Documentación Interna" };
  };

  const { title, subtitle } = getPageTitle();

  const sidebarWidth = 257;

  return (
    <div className="min-h-screen bg-background dark:bg-[#0a0a0a] flex flex-col">
      {/* Fixed Header - SIEMPRE AMARILLO */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-yellow-600 h-16">
        <div className="h-full flex items-center px-4 gap-4">
          {/* Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-black hover:bg-black/10 flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo - CLICKEABLE */}
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
          <div className="h-8 w-px bg-black/20" />

          {/* Page Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-black truncate">{title}</h1>
            <p className="text-xs text-black/70 truncate hidden sm:block">{subtitle}</p>
          </div>

          {/* Settings Button - NUEVO */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettingsModal(true)}
            className="text-black hover:bg-black/10 flex-shrink-0"
            title="Configuración"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Usuario en header - CLICKEABLE para ir a tareas */}
          {username && (
            <button
              onClick={() => navigate("/my-tasks")}
              className="flex items-center gap-2 px-3 py-1.5 bg-black/10 rounded-lg hover:bg-black/20 transition-colors"
              title="Ir a mis tareas"
            >
              <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
                <span className="text-black text-sm font-semibold">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-black hidden sm:inline">{username}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex pt-16 flex-1">
        {/* Collapsible Sidebar */}
        <aside 
          className={cn(
            "fixed left-0 top-16 bottom-0 z-40 bg-sidebar dark:bg-[#0f0f0f] transition-all duration-300"
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
                        ? "bg-sidebar-accent dark:bg-[#2a2a2a] text-sidebar-accent-foreground dark:text-white font-semibold"
                        : "text-sidebar-foreground dark:text-gray-300 hover:bg-sidebar-accent/50 dark:hover:bg-[#1a1a1a] font-medium"
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
            <div className="border-t border-sidebar-border dark:border-[#2a2a2a] p-2 space-y-1">
              {/* Ayuda con pop-up */}
              <button
                onClick={() => setShowHelpDialog(true)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground dark:text-gray-300 transition-colors hover:bg-sidebar-accent/50 dark:hover:bg-[#1a1a1a]",
                  sidebarCollapsed && "justify-center px-2"
                )}
                title={sidebarCollapsed ? "Ayuda y Soporte" : undefined}
              >
                <HelpCircle className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && "Ayuda y Soporte"}
              </button>

              <button
                onClick={async () => {
                  await signOut();
                  navigate("/login");
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground dark:text-gray-300 transition-colors hover:bg-sidebar-accent/50 dark:hover:bg-[#1a1a1a]",
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

      {/* Dialog de Ayuda */}
      <AlertDialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <AlertDialogContent className="bg-card dark:bg-[#0f0f0f] border-border dark:border-[#2a2a2a]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 dark:text-white">
              <HelpCircle className="h-5 w-5" />
              Ayuda y Soporte
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">
              Para cualquier ayuda o soporte técnico, por favor contacta a nuestro equipo de
              operaciones:
              <div className="mt-4 p-3 bg-accent/10 dark:bg-[#F7DC6F]/10 border border-accent/20 dark:border-[#F7DC6F]/30 rounded-lg">
                <p className="text-accent dark:text-[#F7DC6F] font-medium">
                  📧 operaciones@bukz.co
                </p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground dark:text-gray-400">
                Nuestro equipo responderá a tu solicitud lo antes posible.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowHelpDialog(false)}
              className="bg-primary dark:bg-[#F7DC6F] text-primary-foreground dark:text-black"
            >
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Configuración - NUEVO */}
      <SettingsModal 
        open={showSettingsModal} 
        onOpenChange={setShowSettingsModal} 
      />
    </div>
  );
};

export default AppLayout;