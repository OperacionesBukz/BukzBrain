import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Library, ClipboardList, HelpCircle, ChevronLeft, ChevronRight, Home, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo-bukz.png";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Operaciones", icon: ClipboardList, path: "/operaciones" },
  { label: "Librerías", icon: Library, path: "/librerias" },
];

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ 
  collapsed: controlledCollapsed, 
  onCollapsedChange 
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const setIsCollapsed = onCollapsedChange || setInternalCollapsed;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo - Altura sincronizada con header (py-6 = 24px arriba + 24px abajo = 48px + contenido) */}
        <div className="flex items-center justify-center border-b-0 bg-sidebar px-2 py-6">
          {isCollapsed ? (
            <img 
              src={logoImage} 
              alt="Company Logo" 
              className="h-8 w-8 object-contain cursor-pointer"
              onClick={() => navigate("/")}
            />
          ) : (
            <img 
              src={logoImage} 
              alt="Company Logo" 
              className="h-10 w-auto object-contain cursor-pointer"
              onClick={() => navigate("/")}
            />
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isCollapsed && "justify-center px-2",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 font-medium"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom section with Help and Logout */}
        <div className="border-t border-sidebar-border p-2 space-y-1">
          <a
            href="#"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Ayuda y Soporte" : undefined}
          >
            <HelpCircle className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && "Ayuda y Soporte"}
          </a>
          
          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-destructive/90 hover:text-destructive-foreground",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Cerrar Sesión" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && "Cerrar Sesión"}
          </button>
        </div>
      </div>
    </aside>
  );
}