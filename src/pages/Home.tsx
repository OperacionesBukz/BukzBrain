import { useNavigate } from "react-router-dom";
import { Library, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

const HomeMinimalist = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: "operaciones",
      title: "Operaciones",
      description: "Guías y procedimientos para gestión operativa de productos",
      icon: ClipboardList,
      path: "/operaciones",
    },
    {
      id: "librerias",
      title: "Librerías",
      description: "Descarga formatos, guías e instructivos oficiales de la empresa",
      icon: Library,
      path: "/librerias",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary border-b border-border">
        <div className="container mx-auto px-8 py-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Bukz Brain</h1>
          <p className="text-foreground/70">Sistema de Documentación Interna</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {modules.map((module) => {
            const Icon = module.icon;
            
            return (
              <div
                key={module.id}
                className="group relative overflow-hidden rounded-3xl border-2 border-gray-200 bg-white hover:border-primary transition-all duration-300 hover:shadow-2xl"
              >
                {/* Card Content */}
                <div className="p-16 h-full flex flex-col items-center justify-center text-center space-y-8">
                  {/* Massive Icon - Ultra Focus */}
                  <div className="relative">
                    {/* Simple icon - no container, just the icon itself */}
                    <Icon className="h-40 w-40 text-gray-900 stroke-[1] group-hover:text-primary transition-colors duration-300" />
                  </div>

                  {/* Title */}
                  <h2 className="text-4xl font-bold text-gray-900">
                    {module.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 text-lg max-w-md leading-relaxed">
                    {module.description}
                  </p>

                  {/* Button */}
                  <Button
                    onClick={() => navigate(module.path)}
                    className="mt-6 bg-gray-900 text-white hover:bg-primary hover:text-gray-900 font-semibold px-10 py-7 text-lg rounded-2xl transition-all duration-200"
                  >
                    Acceder al módulo
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default HomeMinimalist;