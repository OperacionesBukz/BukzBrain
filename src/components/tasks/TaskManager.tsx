import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
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
        const allSubtasksComplete = updatedSubtasks.every(st => st.completed);
        return {
          ...task,
          subtasks: updatedSubtasks,
          completed: allSubtasksComplete && updatedSubtasks.length > 0
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

  return (
    <Card className="mb-6 bg-[#161A15] border-[#161A15]">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Tareas Activas</span>
          <span className="text-sm font-normal text-gray-400">
            {tasks.filter(t => !t.completed).length} pendiente(s)
          </span>
        </CardTitle>
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
          <Button onClick={addTask} size="sm" className="flex-shrink-0">
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>

        {/* Lista de tareas */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              No hay tareas activas. Agrega una nueva tarea para comenzar.
            </p>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className={`border rounded-lg p-3 ${
                  task.completed ? "bg-gray-800/50 border-gray-700" : "bg-gray-800 border-gray-600"
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
                    <p
                      className={`text-white ${
                        task.completed ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {task.text}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Por: {task.createdBy} • {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {task.subtasks.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(task.id)}
                        className="h-8 w-8 p-0"
                      >
                        {task.expanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Subtareas */}
                {task.expanded && (
                  <div className="ml-8 mt-3 space-y-2">
                    {task.subtasks.map(subtask => (
                      <div key={subtask.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={() => toggleSubtaskComplete(task.id, subtask.id)}
                          className="h-4 w-4"
                        />
                        <p
                          className={`text-sm flex-1 ${
                            subtask.completed ? "line-through text-gray-500" : "text-gray-300"
                          }`}
                        >
                          {subtask.text}
                        </p>
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
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Nueva subtarea..."
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
                        variant="outline"
                        className="h-8 text-xs"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Nota informativa */}
        {tasks.length > 0 && (
          <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700">
            💡 Las tareas son visibles para todos los usuarios. Click en la flecha para ver/agregar subtareas.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskManager;
