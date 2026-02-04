import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

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
  created_by: string;
  created_at: string;
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState<{ [key: string]: string }>({});
  const [currentUser, setCurrentUser] = useState("");
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const username = localStorage.getItem("username") || "Usuario";
    setCurrentUser(username);
    loadTasks();

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          console.log('🔄 Actualización detectada');
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error:", error);
        return;
      }

      const parsedTasks = (data || []).map(task => ({
        ...task,
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
        expanded: expandedTaskIds.has(task.id) // Mantener estado expandido
      }));

      setTasks(parsedTasks);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) {
      toast({
        title: "Campo vacío",
        description: "Por favor ingresa un texto para la tarea",
        variant: "destructive"
      });
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
      subtasks: [],
      created_by: currentUser,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('tasks').insert([newTask]);
      setNewTaskText("");
      setShowAddTask(false);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const addSubtask = async (taskId: string) => {
    const subtaskText = newSubtaskText[taskId]?.trim();
    if (!subtaskText) {
      toast({
        title: "Campo vacío",
        description: "Por favor ingresa un texto para la subtarea",
        variant: "destructive"
      });
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubtask = {
      id: Date.now().toString(),
      text: subtaskText,
      completed: false
    };

    try {
      await supabase
        .from('tasks')
        .update({ subtasks: [...task.subtasks, newSubtask] })
        .eq('id', taskId);

      setNewSubtaskText({ ...newSubtaskText, [taskId]: "" });
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;
    const updatedSubtasks = task.subtasks.map(st => ({ ...st, completed: newCompleted }));

    try {
      await supabase
        .from('tasks')
        .update({ completed: newCompleted, subtasks: updatedSubtasks })
        .eq('id', taskId);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const toggleSubtaskComplete = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    const allSubtasksComplete = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);

    try {
      await supabase
        .from('tasks')
        .update({ subtasks: updatedSubtasks, completed: allSubtasksComplete })
        .eq('id', taskId);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await supabase.from('tasks').delete().eq('id', taskId);
      expandedTaskIds.delete(taskId);
      setExpandedTaskIds(new Set(expandedTaskIds));
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      await supabase
        .from('tasks')
        .update({ subtasks: task.subtasks.filter(st => st.id !== subtaskId) })
        .eq('id', taskId);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTaskIds);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTaskIds(newExpanded);
    
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, expanded: !task.expanded } : task
    ));
  };

  const getSubtaskProgress = (task: Task) => {
    if (task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter(st => st.completed).length;
    const total = task.subtasks.length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const renderTask = (task: Task) => {
    const progress = getSubtaskProgress(task);
    
    return (
      <div
        key={task.id}
        className={`border rounded-lg p-3 transition-all ${
          task.completed 
            ? "bg-green-900/20 border-green-600" 
            : "bg-gray-800 border-gray-600"
        }`}
      >
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
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-gray-400">
                Por: {task.created_by} • {new Date(task.created_at).toLocaleDateString()}
              </p>
              {!task.expanded && progress && (
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#F7DC6F] transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {progress.completed}/{progress.total}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(task.id)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              {task.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
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

        {task.expanded && (
          <div className="ml-8 mt-3 space-y-2">
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
                {subtask.completed && <CheckCircle2 className="h-3 w-3 text-green-400" />}
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
                className="h-8 text-xs flex-shrink-0 bg-[#F7DC6F] hover:bg-[#F7DC6F]/90 text-black"
              >
                <Plus className="h-3 w-3 mr-1" />
                Agregar
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="mb-6 bg-[#161A15] border-[#161A15]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-white">Tareas Activas</CardTitle>
        {!showAddTask ? (
          <Button 
            onClick={() => setShowAddTask(true)}
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nueva tarea
          </Button>
        ) : null}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showAddTask && (
          <div className="flex gap-2 pb-4 border-b border-gray-700">
            <Input
              placeholder="Escribe la nueva tarea..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
              className="bg-white flex-1 border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            <Button 
              onClick={addTask} 
              size="sm"
              className="flex-shrink-0 bg-[#F7DC6F] hover:bg-[#F7DC6F]/90 text-black"
            >
              <Plus className="h-4 w-4 mr-1" />
              Crear
            </Button>
            <Button 
              onClick={() => {
                setShowAddTask(false);
                setNewTaskText("");
              }}
              size="sm"
              variant="outline"
              className="flex-shrink-0"
            >
              Cancelar
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Pendientes</h3>
              <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">{pendingTasks.length}</span>
            </div>
            <div className="space-y-3">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-700 rounded-lg h-32 flex flex-col items-center justify-center">
                  <p>¡No hay tareas pendientes!</p>
                  <p className="text-xs mt-1">Agrega una nueva tarea</p>
                </div>
              ) : (
                pendingTasks.map(renderTask)
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Completadas</h3>
              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">{completedTasks.length}</span>
            </div>
            <div className="space-y-3">
              {completedTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-700 rounded-lg h-32 flex flex-col items-center justify-center">
                  <p>Aún no hay tareas completadas</p>
                </div>
              ) : (
                completedTasks.map(renderTask)
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            💡 Click en la flecha (→) para expandir y ver/agregar subtareas. 
            <span className="ml-2 text-green-400">🔄 Actualizaciones en tiempo real</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskManager;

