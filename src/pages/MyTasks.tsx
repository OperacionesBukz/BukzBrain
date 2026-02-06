import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import PersonalTaskManager from "@/components/tasks/PersonalTaskManager";

const MyTasks = () => {
  const navigate = useNavigate();
  const currentUser = localStorage.getItem("username") || "Usuario";

  return (
    <>
      {/* Header */}
      <header className="border-b border-border bg-primary px-8 py-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-foreground hover:bg-foreground/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-foreground flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mi Panel de Tareas</h1>
              <p className="text-sm text-foreground/80">
                Gestiona tus tareas personales, {currentUser}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8 max-w-6xl mx-auto">
        {/* Información de Privacidad */}
        <div className="mb-6 p-4 bg-[#161A15] border border-[#F7DC6F] rounded-lg">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-[#F7DC6F] flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🔒</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm mb-1">
                Panel Privado
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed">
                Este es tu espacio personal de tareas. Solo tú puedes ver y editar las tareas que crees aquí. 
                Ningún otro usuario tiene acceso a tu información.
              </p>
            </div>
          </div>
        </div>

        {/* Task Manager Personal */}
        <PersonalTaskManager />

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
          <p className="text-xs text-gray-400 leading-relaxed">
            💡 <strong className="text-gray-300">Tip:</strong> Utiliza este panel para organizar tus tareas diarias, 
            proyectos personales y recordatorios. Puedes agregar subtareas para dividir tareas grandes en pasos más pequeños.
          </p>
        </div>
      </div>
    </>
  );
};

export default MyTasks;
