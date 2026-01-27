import { useNavigate } from "react-router-dom";
import { Library, ClipboardList } from "lucide-react";

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {modules.map((module) => {
          const Icon = module.icon;
          
          return (
            <button
              key={module.id}
              onClick={() => navigate(module.path)}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-2 border-gray-200 hover:border-gray-300 text-left w-full"
            >
              {/* Card Content */}
              <div className="flex flex-col items-center text-center p-8 space-y-4">
                {/* Icon Section - Top */}
                <div className="w-full flex items-center justify-center py-4">
                  <div className="relative">
                    {/* Icon with subtle background */}
                    <div className="bg-gray-50 rounded-xl p-6 group-hover:bg-gray-100 transition-colors duration-300">
                      <Icon className="h-20 w-20 text-gray-900 stroke-[1]" />
                    </div>
                  </div>
                </div>

                {/* Text Content - Bottom */}
                <div className="space-y-2 w-full">
                  {/* Title */}
                  <h2 className="text-2xl font-bold text-gray-900">
                    {module.title}
                  </h2>

                  {/* Description/Subtitle */}
                  <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
                    {module.description}
                  </p>

                  {/* Button */}
                  <div className="pt-3">
                    <div className="inline-flex items-center justify-center bg-gray-900 text-white font-medium px-6 py-3 text-sm rounded-lg transition-all duration-200 group-hover:bg-gray-800">
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