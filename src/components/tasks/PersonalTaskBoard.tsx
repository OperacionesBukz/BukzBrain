import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronRight, StickyNote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

interface PersonalTask {
  id: string;
  text: string;
  notes: string;
  subtasks: Subtask[];
  completed: boolean;
  created_by: string;
  created_at: string;
}

const PersonalTaskBoard = () => {
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskText, setEditingSubtaskText] = useState("");
  const [newSubtaskText, setNewSubtaskText] = useState<{ [key: string]: string }>({});
  
  // NUEVO: Estado local para las notas mientras se editan
  const [localNotes, setLocalNotes] = useState<{ [key: string]: string }>({});
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    const username = localStorage.getItem("username") || "Usuario";
    setCurrentUser(username);
    loadPersonalTasks(username);

    const interval = setInterval(() => {
      // No recargar si está editando algo
      if (!editingTaskId && !editingSubtaskId && !editingNotesId) {
        loadPersonalTasks(username);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [editingTaskId, editingSubtaskId, editingNotesId]);

  const loadPersonalTasks = async (username: string) => {
    try {
      const { data, error } = await supabase
        .from('personal_tasks')
        .select('*')
        .eq('created_by', username)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error al cargar tareas:", error);
        return;
      }

      const tasksWithDefaults = (data || []).map(task => ({
        ...task,
        notes: task.notes || "",
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : []
      }));

      setTasks(tasksWithDefaults);
    } catch (err) {
      console.error("Error inesperado:", err);
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

    if (isLoading) return;
    setIsLoading(true);

    const newTask: PersonalTask = {
      id: `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      text: newTaskText,
      notes: "",
      subtasks: [],
      completed: false,
      created_by: currentUser,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('personal_tasks')
        .insert([newTask])
        .select();
      
      if (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setNewTaskText("");
        await loadPersonalTasks(currentUser);
        toast({
          title: "✅ Tarea creada",
          description: "Tu tarea personal se ha agregado",
        });
      }
    } catch (err) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: "Ocurrió un error al crear la tarea",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskText = async (taskId: string, newText: string) => {
    if (!newText.trim()) {
      toast({
        title: "Campo vacío",
        description: "El nombre de la tarea no puede estar vacío",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('personal_tasks')
        .update({ text: newText })
        .eq('id', taskId)
        .eq('created_by', currentUser);

      if (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "No se pudo actualizar la tarea",
          variant: "destructive"
        });
      } else {
        await loadPersonalTasks(currentUser);
        setEditingTaskId(null);
        toast({
          title: "✅ Actualizado",
          description: "El nombre de la tarea se actualizó",
        });
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const updateTaskNotes = async (taskId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('personal_tasks')
        .update({ notes })
        .eq('id', taskId)
        .eq('created_by', currentUser);

      if (error) {
        console.error("Error:", error);
      } else {
        await loadPersonalTasks(currentUser);
        setEditingNotesId(null);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const addSubtask = async (taskId: string) => {
    const subtaskText = newSubtaskText[taskId]?.trim();
    if (!subtaskText) {
      toast({
        title: "Campo vacío",
        description: "Ingresa un texto para la subtarea",
        variant: "destructive"
      });
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubtask: Subtask = {
      id: `subtask_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      text: subtaskText,
      completed: false
    };

    const updatedSubtasks = [...task.subtasks, newSubtask];

    try {
      const { error } = await supabase
        .from('personal_tasks')
        .update({ subtasks: updatedSubtasks })
        .eq('id', taskId)
        .eq('created_by', currentUser);

      if (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "No se pudo crear la subtarea",
          variant: "destructive"
        });
      } else {
        setNewSubtaskText({ ...newSubtaskText, [taskId]: "" });
        await loadPersonalTasks(currentUser);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const updateSubtaskText = async (taskId: string, subtaskId: string, newText: string) => {
    if (!newText.trim()) {
      toast({
        title: "Campo vacío",
        description: "El nombre de la subtarea no puede estar vacío",
        variant: "destructive"
      });
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, text: newText } : st
    );

    try {
      const { error } = await supabase
        .from('personal_tasks')
        .update({ subtasks: updatedSubtasks })
        .eq('id', taskId)
        .eq('created_by', currentUser);

      if (error) {
        console.error("Error:", error);
      } else {
        await loadPersonalTasks(currentUser);
        setEditingSubtaskId(null);
        toast({
          title: "✅ Actualizado",
          description: "El nombre de la subtarea se actualizó",
        });
      }
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

    const allSubtasksComplete = updatedSubtasks.length > 0 && 
      updatedSubtasks.every(st => st.completed);

    try {
      const { error } = await supabase
        .from('personal_tasks')
        .update({ 
          subtasks: updatedSubtasks,
          completed: allSubtasksComplete 
        })
        .eq('id', taskId)
        .eq('created_by', currentUser);

      if (error) {
        console.error("Error:", error);
      } else {
        await loadPersonalTasks(currentUser);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);

    try {
      const { error } = await supabase
        .from('personal_tasks')
        .update({ subtasks: updatedSubtasks })
        .eq('id', taskId)
        .eq('created_by', currentUser);

      if (error) {
        console.error("Error:", error);
      } else {
        await loadPersonalTasks(currentUser);
        toast({
          title: "Subtarea eliminada",
          description: "La subtarea se eliminó correctamente",
        });
      }
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
      const { error } = await supabase
        .from('personal_tasks')
        .update({ 
          completed: newCompleted,
          subtasks: updatedSubtasks 
        })
        .eq('id', taskId)
        .eq('created_by', currentUser);

      if (error) {
        console.error("Error:", error);
      } else {
        await loadPersonalTasks(currentUser);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('personal_tasks')
        .delete()
        .eq('id', taskId)
        .eq('created_by', currentUser);
      
      if (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "No se pudo eliminar la tarea",
          variant: "destructive"
        });
      } else {
        await loadPersonalTasks(currentUser);
        toast({
          title: "Tarea eliminada",
          description: "La tarea se eliminó correctamente",
        });
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getSubtaskProgress = (task: PersonalTask) => {
    if (task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter(st => st.completed).length;
    const total = task.subtasks.length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const TaskCard = ({ task }: { task: PersonalTask }) => {
    const isExpanded = expandedTasks.has(task.id);
    const progress = getSubtaskProgress(task);
    const isEditingTask = editingTaskId === task.id;
    
    // Usar estado local para las notas mientras se editan
    const currentNotes = editingNotesId === task.id 
      ? (localNotes[task.id] ?? task.notes) 
      : task.notes;

    return (
      <div
        className={`border rounded-lg p-3 transition-all ${
          task.completed 
            ? "bg-gray-900/50 border-gray-700" 
            : "bg-gray-800 border-gray-700 hover:border-gray-600"
        }`}
      >
        {/* Header de la tarea */}
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => toggleTaskComplete(task.id)}
            className="mt-1"
          />
          
          <div className="flex-1 space-y-2">
            {/* Nombre de la tarea (editable) */}
            {isEditingTask ? (
              <div className="flex gap-2">
                <Input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") updateTaskText(task.id, editingText);
                  }}
                  className="bg-white text-sm h-8"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => updateTaskText(task.id, editingText)}
                  className="h-8 bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingTaskId(null)}
                  className="h-8"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className={`text-sm flex-1 ${task.completed ? "line-through text-gray-500" : "text-gray-200"}`}>
                  {task.text}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTaskId(task.id);
                    setEditingText(task.text);
                  }}
                  className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Progreso de subtareas */}
            {progress && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all" 
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <span>{progress.completed}/{progress.total}</span>
              </div>
            )}

            {/* Indicadores */}
            <div className="flex items-center gap-2 text-xs">
              {task.subtasks.length > 0 && (
                <span className="text-gray-400">
                  {task.subtasks.length} subtarea{task.subtasks.length !== 1 ? 's' : ''}
                </span>
              )}
              {task.notes && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <StickyNote className="h-3 w-3" />
                  Tiene notas
                </span>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(task.id)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteTask(task.id)}
              className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Detalles expandidos */}
        {isExpanded && (
          <div className="ml-9 mt-3 space-y-3 pl-3 border-l-2 border-gray-700">
            {/* Notas - USANDO ESTADO LOCAL */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
                <StickyNote className="h-3 w-3" />
                Notas
              </label>
              <Textarea
                value={currentNotes}
                onChange={(e) => {
                  setLocalNotes({ ...localNotes, [task.id]: e.target.value });
                }}
                onFocus={() => {
                  setEditingNotesId(task.id);
                  setLocalNotes({ ...localNotes, [task.id]: task.notes });
                }}
                onBlur={() => {
                  updateTaskNotes(task.id, localNotes[task.id] || task.notes);
                }}
                placeholder="Agrega notas o recordatorios..."
                className="bg-white text-sm min-h-[60px]"
              />
            </div>

            {/* Subtareas */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Subtareas
              </label>
              
              {/* Lista de subtareas */}
              {task.subtasks.length > 0 && (
                <div className="space-y-2 mb-2">
                  {task.subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-2 bg-gray-900/50 p-2 rounded">
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => toggleSubtaskComplete(task.id, subtask.id)}
                        className="h-3.5 w-3.5"
                      />
                      
                      {editingSubtaskId === subtask.id ? (
                        <div className="flex gap-2 flex-1">
                          <Input
                            value={editingSubtaskText}
                            onChange={(e) => setEditingSubtaskText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                updateSubtaskText(task.id, subtask.id, editingSubtaskText);
                              }
                            }}
                            className="bg-white text-xs h-7"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => updateSubtaskText(task.id, subtask.id, editingSubtaskText)}
                            className="h-7 px-2 bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingSubtaskId(null)}
                            className="h-7 px-2"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className={`text-xs flex-1 ${
                            subtask.completed ? "line-through text-gray-500" : "text-gray-300"
                          }`}>
                            {subtask.text}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingSubtaskId(subtask.id);
                              setEditingSubtaskText(subtask.text);
                            }}
                            className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSubtask(task.id, subtask.id)}
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Agregar nueva subtarea */}
              <div className="flex gap-2">
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
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header con input */}
      <Card className="bg-[#161A15] border-[#161A15]">
        <CardHeader className="pb-4">
          <CardTitle className="text-white">Mis Tareas Personales</CardTitle>
          <p className="text-xs text-gray-400 mt-1">
            🔒 Privadas • 📝 Con subtareas y notas • ✏️ Editables
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="¿Qué necesitas hacer?"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && addTask()}
              className="bg-white"
              disabled={isLoading}
            />
            <Button
              onClick={addTask}
              disabled={isLoading}
              className="bg-[#F7DC6F] hover:bg-[#F7DC6F]/90 text-black flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isLoading ? "Guardando..." : "Agregar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tablero Horizontal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna: En Proceso */}
        <Card className="bg-[#161A15] border-[#161A15]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                📋 En Proceso
                <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                  {pendingTasks.length}
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[700px] overflow-y-auto">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm border border-dashed border-gray-700 rounded-lg">
                  <p>No hay tareas pendientes</p>
                  <p className="text-xs text-gray-600 mt-1">¡Excelente! 🎉</p>
                </div>
              ) : (
                pendingTasks.map(task => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </CardContent>
        </Card>

        {/* Columna: Finalizadas */}
        <Card className="bg-[#161A15] border-[#161A15]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                ✅ Finalizadas
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                  {completedTasks.length}
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[700px] overflow-y-auto">
              {completedTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm border border-dashed border-gray-700 rounded-lg">
                  <p>Aún no has completado tareas</p>
                </div>
              ) : (
                completedTasks.map(task => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalTaskBoard;