import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  subtasks: Subtask[];
  expanded: boolean;
  createdBy: string;
  createdAt: string;
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newSubtaskText, setNewSubtaskText] = useState<{ [key: string]: string }>({});
  const [currentUser, setCurrentUser] = useState("");
  const { toast } = useToast();

  // Cargar usuario actual y tareas al montar
  useEffect(() => {
    const username = localStorage.getItem("username") || "Usuario";
    setCurrentUser(username);
    loadTasks();
  }, []);

  // Cargar tareas desde localStorage
  const loadTasks = () => {
    const savedTasks = localStorage.getItem("bukz_tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  };

  // Guardar tareas en localStorage
  const saveTasks = (updatedTasks: Task[]) => {
    localStorage.setItem("bukz_tasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  // Agregar nueva tarea principal
  const addTask = () => {
    if (!newTaskText.trim()) {
      toast({
        title: "Campo vacío",
        description: "Por favor ingresa un texto para la tarea",
        variant: "destructive"
      });
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
      subtasks: [],
      expanded: false,
      createdBy: currentUser,
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    setNewTaskText("");

    toast({
      title: "Tarea creada",
      description: "La tarea ha sido agregada exitosamente"
    });
  };

  // Agregar subtarea
  const addSubtask = (taskId: string) => {
    const subtaskText = newSubtaskText[taskId]?.trim();
    if (!subtaskText) {
      toast({
        title: "Campo vacío",
        description: "Por favor ingresa un texto para la subtarea",
        variant: "destructive"
      });
      return;
    }

    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: [
            ...task.subtasks,
            {
              id: Date.now().toString(),
              text: subtaskText,
              completed: false
            }
          ]
        };
      }
      return task;
    });

    saveTasks(updatedTasks);
    setNewSubtaskText({ ...newSubtaskText, [taskId]: "" });

    toast({
      title: "Subtarea agregada",
      description: "La subtarea ha sido creada exitosamente"
    });
  };

  // Toggle completar tarea principal
  const toggleTaskComplete = (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        // Si se marca la tarea, marcar todas las subtareas
        return {
          ...task,
          completed: newCompleted,
          subtasks: task.subtasks.map(st => ({ ...st, completed: newCompleted }))
        };
      }
      return task;
    });
    saveTasks(updatedTasks);
  };

  // Toggle completar subtarea
  const toggleSubtaskComplete = (taskId: string, subtaskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map(st =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        // Si todas las subtareas están completas, marcar la tarea principal
        const allSubtasksComplete = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);
        return {
          ...task,
          subtasks: updatedSubtasks,
          completed: allSubtasksComplete
        };
      }
      return task;
    });
    saveTasks(updatedTasks);
  };

  // Eliminar tarea
  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
    toast({
      title: "Tarea eliminada",
      description: "La tarea ha sido eliminada correctamente"
    });
  };

  // Eliminar subtarea
  const deleteSubtask = (taskId: string, subtaskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.filter(st => st.id !== subtaskId)
        };
      }
      return task;
    });
    saveTasks(updatedTasks);
  };

  // Toggle expandir/colapsar tarea
  const toggleExpanded = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, expanded: !task.expanded } : task
    );
    saveTasks(updatedTasks);
  };

  // Filtrar tareas
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Renderizar una tarea
  const renderTask = (task: Task) => (
    <div
      key={task.id}
      className={`border rounded-lg p-3 transition-all ${
        task.completed 
          ? "bg-green-900/20 border-green-600" 
          : "bg-gray-800 border-gray-600"
      }`}
    >
      {/* Tarea principal */}
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => toggleTaskComplete(task.id)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-white ${task.completed ? "font-semibold" : ""}`}>
              {task.text}
            </p>
            {task.completed && (
              <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Por: {task.createdBy} • {new Date(task.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleExpanded(task.id)}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            title={task.expanded ? "Colapsar" : "Expandir para agregar subtareas"}
          >
            {task.expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteTask(task.id)}
            className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
            title="Eliminar tarea"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Subtareas */}
      {task.expanded && (
        <div className="ml-8 mt-3 space-y-2">
          {/* Lista de subtareas */}
          {task.subtasks.map(subtask => (
            <div key={subtask.id} className="flex items-center gap-2">
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={() => toggleSubtaskComplete(task.id, subtask.id)}
                className="h-4 w-4"
              />
              <p className={`text-sm flex-1 ${subtask.completed ? "text-green-400 font-medium" : "text-gray-300"}`}>
                {subtask.text}
              </p>
              {subtask.completed && (
                <CheckCircle2 className="h-3 w-3 text-green-400" />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteSubtask(task.id, subtask.id)}
                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {/* Agregar subtarea */}
          <div className="flex gap-2 mt-2 pt-2 border-t border-gray-700">
            <Input
              placeholder="Agregar subtarea..."
              value={newSubtaskText[task.id] || ""}
              onChange={(e) =>
                setNewSubtaskText({ ...newSubtaskText, [task.id]: e.target.value })
              }
              onKeyPress={(e) => e.key === "Enter" && addSubtask(task.id)}
              className="bg-white text-sm h-8"
            />
            <Button
              onClick={() => addSubtask(task.id)}
              size="sm"
              className="h-8 text-xs flex-shrink-0"
            >
              <Plus className="h-3 w-3 mr-1" />
              Agregar
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card className="mb-6 bg-[#161A15] border-[#161A15]">
      <CardHeader>
        <CardTitle className="text-white">Tareas Activas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Agregar nueva tarea */}
        <div className="flex gap-2">
          <Input
            placeholder="Nueva tarea (ej: Devolución proveedor X)"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            className="bg-white flex-1"
          />
          <Button onClick={addTask} className="flex-shrink-0 bg-[#F7DC6F] hover:bg-[#F7DC6F]/90 text-black">
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>

        {/* Dos columnas: Pendientes y Completadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna Izquierda: Tareas Pendientes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Pendientes
              </h3>
              <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                {pendingTasks.length} {pendingTasks.length === 1 ? "tarea" : "tareas"}
              </span>
            </div>
            <div className="space-y-3">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-700 rounded-lg">
                  <p>¡No hay tareas pendientes!</p>
                  <p className="text-xs mt-1">Agrega una nueva tarea arriba</p>
                </div>
              ) : (
                pendingTasks.map(renderTask)
              )}
            </div>
          </div>

          {/* Columna Derecha: Tareas Completadas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Completadas
              </h3>
              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                {completedTasks.length} {completedTasks.length === 1 ? "tarea" : "tareas"}
              </span>
            </div>
            <div className="space-y-3">
              {completedTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-700 rounded-lg">
                  <p>Aún no hay tareas completadas</p>
                  <p className="text-xs mt-1">Marca las tareas pendientes cuando las termines</p>
                </div>
              ) : (
                completedTasks.map(renderTask)
              )}
            </div>
          </div>
        </div>

        {/* Nota informativa */}
        <div className="pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            💡 <strong>Instrucciones:</strong> Click en la flecha (→) para expandir y agregar subtareas. 
            Las tareas se mueven automáticamente entre columnas al marcarlas como completadas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskManager;