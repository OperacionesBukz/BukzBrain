import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DocumentLibrary } from "@/components/documents/DocumentLibrary";
import { Library, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const [activeSection, setActiveSection] = useState<"librerias" | "operaciones">("librerias");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const headerConfig = {
    librerias: {
      title: "Biblioteca de Documentos",
      description: "Descarga formatos, guías e instructivos oficiales de la empresa.",
      icon: Library,
    },
    operaciones: {
      title: "Operaciones",
      description: "Guías y procedimientos para gestión operativa.",
      icon: ClipboardList,
    },
  };

  const { title, description, icon: Icon } = headerConfig[activeSection];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={(section) => setActiveSection(section as "librerias" | "operaciones")}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      
      {/* Main content area - offset for sidebar */}
      <main className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "pl-16" : "pl-64"
      )}>
        {/* Header with yellow background */}
        <header className="border-b border-border bg-primary px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="text-sm text-foreground/80">
                {description}
              </p>
            </div>
          </div>
        </header>

        {/* Content with transition */}
        <div className="p-8">
          <div className="transition-opacity duration-300 ease-in-out">
            <DocumentLibrary section={activeSection} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
