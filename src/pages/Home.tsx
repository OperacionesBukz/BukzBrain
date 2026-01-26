import { useNavigate } from "react-router-dom";
import { Library, ClipboardList } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Home = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: "operaciones",
      title: "Operaciones",
      description: "Guías y procedimientos para gestión operativa de productos",
      icon: ClipboardList,
      color: "bg-primary",
      path: "/operaciones",
    },
    {
      id: "librerias",
      title: "Librerías",
      description: "Descarga formatos, guías e instructivos oficiales de la empresa",
      icon: Library,
      color: "bg-accent",
      path: "/librerias",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-foreground mb-4">Bukz Brain</h1>
        <p className="text-lg text-muted-foreground">
          Sistema de Documentación Interna
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card
              key={module.id}
              className="card-hover-shadow border-border bg-card cursor-pointer transition-all duration-300 hover:scale-105"
              onClick={() => navigate(module.path)}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary">
                  <Icon className="h-10 w-10 text-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold text-card-foreground">
                  {module.title}
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground pt-2">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <button className="mt-4 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary/90">
                  Acceder al módulo
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
