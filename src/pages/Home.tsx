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
    <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
        {modules.map((module) => {
          const Icon = module.icon;
          
          return (
            <div
              key={module.id}
              className="group bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Card Content */}
              <div className="flex flex-col items-center text-center p-12 space-y-6">
                {/* Icon Section - Top */}
                <div className="w-full flex items-center justify-center py-8">
                  <div className="relative">
                    {/* Icon with subtle background */}
                    <div className="bg-gray-50 rounded-2xl p-8 group-hover:bg-gray-100 transition-colors duration-300">
                      <Icon className="h-32 w-32 text-gray-900 stroke-[1]" />
                    </div>
                  </div>
                </div>

                {/* Text Content - Bottom */}
                <div className="space-y-3 w-full">
                  {/* Title */}
                  <h2 className="text-3xl font-bold text-gray-900">
                    {module.title}
                  </h2>

                  {/* Description/Subtitle */}
                  <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto">
                    {module.description}
                  </p>

                  {/* Button */}
                  <div className="pt-4">
                    <Button
                      onClick={() => navigate(module.path)}
                      className="bg-gray-900 text-white hover:bg-gray-800 font-medium px-8 py-6 text-base rounded-xl transition-all duration-200 hover:scale-105"
                    >
                      Ver en Google Maps
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;