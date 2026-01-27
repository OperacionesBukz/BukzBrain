import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Library, ClipboardList, HelpCircle, Menu, Home as HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo-bukz.png";
import { Button } from "@/components/ui/button";

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
];

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine page title based on current path
  const getPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath === "/") return { title: "Bukz Brain", subtitle: "Sistema de Documentación Interna" };
    if (currentPath.includes("/operaciones")) return { title: "Operaciones", subtitle: "Guías y procedimientos para gestión operativa" };
    if (currentPath.includes("/librerias")) return { title: "Biblioteca de Documentos", subtitle: "Descarga formatos, guías e instructivos oficiales" };
    return { title: "Bukz Brain", subtitle: "Sistema de Documentación Interna" };
  };

  const { title, subtitle } = getPageTitle();

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

          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <img 
              src={logoImage} 
              alt="Bukz Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>

          {/* Vertical Separator */}
          <div className="h-8 w-px bg-foreground/20" />

          {/* Page Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
            <p className="text-xs text-foreground/70 truncate hidden sm:block">{subtitle}</p>
          </div>
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex pt-16 flex-1">
        {/* Collapsible Sidebar */}
        <aside 
          className={cn(
            "fixed left-0 top-16 bottom-0 z-40 bg-sidebar border-r border-sidebar-border transition-all duration-300",
            sidebarCollapsed ? "w-16" : "w-64"
          )}
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

            {/* Help section at bottom */}
            <div className="border-t border-sidebar-border p-2">
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50",
                  sidebarCollapsed && "justify-center px-2"
                )}
                title={sidebarCollapsed ? "Ayuda y Soporte" : undefined}
              >
                <HelpCircle className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && "Ayuda y Soporte"}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 transition-all duration-300",
            sidebarCollapsed ? "ml-16" : "ml-64"
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
