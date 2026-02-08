import { useNavigate } from "react-router-dom";
import { Library, ClipboardList, FileText } from "lucide-react";

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
    {
      id: "solicitudes",
      title: "Solicitudes",
      description: "Gestiona tus solicitudes de vacaciones, permisos y días especiales",
      icon: FileText,
      path: "/solicitudes",
    },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
        {modules.map((module) => {
          const Icon = module.icon;
          
          return (
            <button
              key={module.id}
              onClick={() => navigate(module.path)}
              className="group rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-2 border-gray-700 hover:border-gray-600 text-left w-full aspect-square"
              style={{ backgroundColor: '#2D2D2D' }}
            >
              {/* Card Content */}
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 h-full">
                {/* Icon Section - Top */}
                <div className="w-full flex items-center justify-center">
                  <div className="relative">
                    {/* Icon with subtle background */}
                    <div className="bg-gray-700/30 rounded-xl p-6 group-hover:bg-gray-700/50 transition-colors duration-300">
                      <Icon className="h-16 w-16 text-gray-100 stroke-[1]" />
                    </div>
                  </div>
                </div>

                {/* Text Content - Bottom */}
                <div className="space-y-2 w-full">
                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-100">
                    {module.title}
                  </h2>

                  {/* Description/Subtitle */}
                  <p className="text-gray-400 text-xs leading-relaxed max-w-sm mx-auto">
                    {module.description}
                  </p>

                  {/* Button */}
                  <div className="pt-2">
                    <div className="inline-flex items-center justify-center bg-gray-100 text-gray-900 font-medium px-5 py-2 text-sm rounded-lg transition-all duration-200 group-hover:bg-white">
                      Ver más
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Home;