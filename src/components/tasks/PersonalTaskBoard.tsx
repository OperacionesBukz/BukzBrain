import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronRight, StickyNote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

interface Task {
  id: string;
  text: string;
  notes: string;
  subtasks: Subtask[];
  completed: boolean;
  created_by: string;
  created_at: string;
  order?: number;
}

function SortableTaskCard({ task, children }: { task: Task; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

const PersonalTaskBoard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskText, setEditingSubtaskText] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    const username = localStorage.getItem("username") || "Usuario";
    setCurrentUser(username);
    loadTasks(username);

    // Polling cada 5 segundos
    const interval = setInterval(() => {
      loadTasks(username);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadTasks = async (username?: string) => {
    const user = username || currentUser;
    if (!user) return;

    try {
      console.log("📥 Cargando tareas para:", user);
      
      const { data, error } = await supabase
        .from('personal_tasks')
        .select('*')
        .eq('created_by', user)
        .order('order', { ascending: true })
        .order('created_at', { ascending: false});

      if (error) {
        console.error("❌ Error al cargar tareas:", error);
        toast({
          title: "Error al cargar",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log("✅ Tareas cargadas:", data?.length || 0);

      const tasksWithDefaults = (data || []).map(task => ({
        ...task,
        notes: task.notes || "",
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
        order: task.order || 0
      }));

      setTasks(tasksWithDefaults);
    } catch (err) {
      console.error("❌ Error inesperado:", err);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overTask = tasks.find(t => t.id === over.id);

    if (!activeTask || !overTask) return;

    if (activeTask.completed !== overTask.completed) {
      try {
        const { error } = await supabase
          .from('personal_tasks')
          .update({ completed: overTask.completed })
          .eq('id', activeTask.id)
          .eq('created_by', currentUser);

        if (!error) {
          loadTasks();
        }
      } catch (err) {
        console.error("Error:", err);
      }
    } else {
      const taskList = tasks.filter(t => t.completed === activeTask.completed);
      const oldIndex = taskList.findIndex(t => t.id === active.id);
      const newIndex = taskList.findIndex(t => t.id === over.id);

      if (oldIndex !== newIndex) {
        const reordered = [...taskList];
        const [removed] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, removed);

        const updates = reordered.map((task, index) => ({
          id: task.id,
          order: index
        }));

        try {
          for (const update of updates) {
            await supabase
              .from('personal_tasks')
              .update({ order: update.order })
              .eq('id', update.id)
              .eq('created_by', currentUser);
          }
          loadTasks();
        } catch (err) {
          console.error("Error:", err);
        }
      }
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

    const newTask: Task = {
      id: `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      text: newTaskText,
      notes: "",
      subtasks: [],
      completed: false,
      created_by: currentUser,
      created_at: new Date().toISOString(),
      order: 0
    };

    console.log("💾 Guardando tarea:", newTask);

    try {
      const { data, error } = await supabase
        .from('personal_tasks')
        .insert([newTask])
        .select();
      
      if (error) {
        console.error("❌ Error al guardar:", error);
        toast({
          title: "Error al guardar",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log("✅ Tarea guardada:", data);
        setNewTaskText("");
        toast({
          title: "✅ Tarea creada",
          description: "La tarea se ha agregado correctamente",
        });
        // Recargar tareas
        await loadTasks();
      }
    } catch (err) {
      console.error("❌ Error inesperado:", err);
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
        await loadTasks();
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
      console.log("💾 Guardando notas para tarea:", taskId);
      
      const { error } = await supabase
        .from('personal_tasks')
        .update({ notes })
        .eq('id', taskId)
        .eq('created_by', currentUser);

      if (!error) {
        console.log("✅ Notas guardadas");
      } else {
        console.error("❌ Error al guardar notas:", error);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const addSubtask = async (taskId: string, subtaskText: string) => {
    if (!subtaskText.trim()) {
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
        await loadTasks();
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
        await loadTasks();
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
        await loadTasks();
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
        await loadTasks();
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
        await loadTasks();
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
        await loadTasks();
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

  const getSubtaskProgress = (task: Task) => {
    if (task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter(st => st.completed).length;
    const total = task.subtasks.length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const TaskCard = ({ task }: { task: Task }) => {
    const isExpanded = expandedTasks.has(task.id);
    const progress = getSubtaskProgress(task);
    const isEditingTask = editingTaskId === task.id;
    
    const subtaskInputRef = useRef<HTMLInputElement>(null);

    return (
      <div
        className={`border rounded-lg p-3 transition-all ${
          task.completed 
            ? "bg-[#1a1a1a] border-[#2a2a2a]" 
            : "bg-[#0f0f0f] border-[#2a2a2a] hover:border-[#3a3a3a]"
        }`}
      >
        <div className="flex items-center gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => toggleTaskComplete(task.id)}
            className="flex-shrink-0"
          />
          
          <div className="flex-1 space-y-2">
            {isEditingTask ? (
              <div className="flex gap-2">
                <Input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") updateTaskText(task.id, editingText);
                  }}
                  className="bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 text-sm h-8"
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

            {progress && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all" 
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <span>{progress.completed}/{progress.total}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs">
              {task.subtasks.length > 0 && (
                <span className="text-gray-400">
                  {task.subtasks.length} subtarea{task.subtasks.length !== 1 ? 's' : ''}
                </span>
              )}
              {task.notes && (
                <span className="flex items-center gap-1 text-yellow-400">
                  {task.subtasks.length > 0 && '• '}<StickyNote className="h-3 w-3" /> Notas
                </span>
              )}
            </div>
          </div>

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

        {isExpanded && (
          <div className="ml-0 mt-3 space-y-3 pl-3 border-l-2 border-[#2a2a2a]">
            {/* Notas - SIMPLIFICADO */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
                <StickyNote className="h-3 w-3" />
                Notas (se guardan al salir del campo)
              </label>
              <textarea
                key={task.id}
                defaultValue={task.notes}
                onBlur={(e) => {
                  updateTaskNotes(task.id, e.target.value);
                }}
                placeholder="Agrega notas o recordatorios..."
                className="w-full bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm min-h-[60px] p-2 rounded-md border border-gray-300 dark:border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#F7DC6F] resize-y"
              />
            </div>

            {/* Subtareas */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Subtareas
              </label>
              
              {task.subtasks.length > 0 && (
                <div className="space-y-2 mb-2">
                  {task.subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-2 bg-[#1a1a1a] p-2 rounded border border-[#2a2a2a]">
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
                            className="bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 text-xs h-7"
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
                <input
                  ref={subtaskInputRef}
                  type="text"
                  placeholder="Agregar subtarea..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && subtaskInputRef.current) {
                      addSubtask(task.id, subtaskInputRef.current.value);
                      subtaskInputRef.current.value = "";
                    }
                  }}
                  className="flex-1 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm h-8 px-3 rounded-md border border-gray-300 dark:border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#F7DC6F]"
                />
                <Button
                  onClick={() => {
                    if (subtaskInputRef.current) {
                      addSubtask(task.id, subtaskInputRef.current.value);
                      subtaskInputRef.current.value = "";
                    }
                  }}
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

  const activeTask = tasks.find(t => t.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        <Card className="bg-[#0f0f0f] border-[#2a2a2a]">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">Mis Tareas Personales</CardTitle>
            <p className="text-xs text-gray-400 mt-1">
              🔒 Privadas • 📝 Con subtareas y notas • 🔄 Arrastra para reorganizar
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="¿Qué necesitas hacer?"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isLoading && addTask()}
                className="bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#0f0f0f] border-[#2a2a2a]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  En Proceso
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                    {pendingTasks.length}
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <SortableContext items={pendingTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 max-h-[700px] overflow-y-auto">
                  {pendingTasks.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 text-sm border border-dashed border-[#2a2a2a] rounded-lg h-[200px] flex flex-col items-center justify-center">
                      <p>No hay tareas pendientes</p>
                      <p className="text-xs text-gray-600 mt-1">¡Excelente! 🎉</p>
                    </div>
                  ) : (
                    pendingTasks.map(task => (
                      <SortableTaskCard key={task.id} task={task}>
                        <TaskCard task={task} />
                      </SortableTaskCard>
                    ))
                  )}
                </div>
              </SortableContext>
            </CardContent>
          </Card>

          <Card className="bg-[#0f0f0f] border-[#2a2a2a]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  Finalizadas
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                    {completedTasks.length}
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <SortableContext items={completedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 max-h-[700px] overflow-y-auto">
                  {completedTasks.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 text-sm border border-dashed border-[#2a2a2a] rounded-lg h-[200px] flex flex-col items-center justify-center">
                      <p>Aún no has completado tareas</p>
                    </div>
                  ) : (
                    completedTasks.map(task => (
                      <SortableTaskCard key={task.id} task={task}>
                        <TaskCard task={task} />
                      </SortableTaskCard>
                    ))
                  )}
                </div>
              </SortableContext>
            </CardContent>
          </Card>
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="bg-[#0f0f0f] border-[#2a2a2a] border rounded-lg p-3 shadow-lg opacity-90 cursor-grabbing">
            <p className="text-sm text-gray-200">{activeTask.text}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default PersonalTaskBoard;