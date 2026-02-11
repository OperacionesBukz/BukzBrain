import PersonalTaskBoard from "@/components/tasks/PersonalTaskBoard";
import { useAuth } from "@/contexts/AuthContext";

const MyTasks = () => {
  const { user } = useAuth();
  const currentUser = user?.username || "Usuario";

  return (
    <div className="p-8">
      {/* Información de Privacidad */}
      <div className="mb-6 p-4 bg-[#F7DC6F]/10 border border-[#F7DC6F]/30 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-[#F7DC6F] flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🔒</span>
          </div>
          <div className="flex-1">
            <h3 className="text-foreground font-semibold text-sm mb-1">
              Panel Privado de {currentUser}
            </h3>
            <p className="text-foreground/80 text-xs leading-relaxed">
              Este es tu espacio personal de tareas. Solo tú puedes ver y editar las tareas que crees aquí. 
              Las tareas del módulo "Operaciones" son completamente independientes y se mantienen separadas.
            </p>
          </div>
        </div>
      </div>

      {/* Task Board Personal */}
      <PersonalTaskBoard />
    </div>
  );
};

export default MyTasks;
