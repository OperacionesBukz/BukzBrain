import { DocumentLibrary } from "@/components/documents/DocumentLibrary";
import TaskManager from "@/components/tasks/TaskManager";

const Operaciones = () => {
  return (
    <div className="p-8">
      {/* Task Manager */}
      <TaskManager />
      
      {/* Document Library */}
      <DocumentLibrary section="operaciones" />
    </div>
  );
};

export default Operaciones;