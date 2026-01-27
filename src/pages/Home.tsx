import { useNavigate } from "react-router-dom";
import { Library, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
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
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              >
                {/* Gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Card Content */}
                <div className="relative bg-gray-900 rounded-3xl p-12 h-full flex flex-col items-center justify-center text-center space-y-6">
                  {/* Large Icon - Main Focus */}
                  <div className="relative">
                    {/* Icon glow effect */}
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-500" />
                    
                    {/* Icon container with yellow background */}
                    <div className="relative bg-primary rounded-3xl p-8 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-2xl">
                      <Icon className="h-24 w-24 text-gray-900 stroke-[1.5]" />
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl font-bold text-white">
                    {module.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-400 text-base max-w-sm leading-relaxed">
                    {module.description}
                  </p>

                  {/* Button */}
                  <Button
                    onClick={() => navigate(module.path)}
                    className="mt-4 bg-primary text-gray-900 hover:bg-primary/90 font-semibold px-8 py-6 text-lg rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-xl"
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

export default Home;