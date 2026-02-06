import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ChevronDown, ChevronRight, CheckCircle2, User } from "lucide-react";
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

const PersonalTaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState<{ [key: string]: string }>({});
  const [currentUser, setCurrentUser] = useState("");
  const [usePolling, setUsePolling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const username = localStorage.getItem("username") || "Usuario";
    setCurrentUser(username);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 PANEL PERSONAL DE TAREAS');
    console.log('🔐 Usuario:', username);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    loadPersonalTasks(username);

    // Configurar Realtime solo para tareas del usuario actual
    console.log('📡 Configurando Realtime para usuario:', username);
    
    const channel = supabase
      .channel('personal-tasks-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `created_by=eq.${username}` // FILTRO POR USUARIO
        },
        (payload) => {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🔥 CAMBIO EN TUS TAREAS');
          console.log('⏰ Timestamp:', new Date().toLocaleTimeString());
          console.log('📋 Tipo:', payload.eventType);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe((status, err) => {
        console.log('📊 Estado de suscripción:', status);
        
        if (err) {
          console.error('❌ Error Realtime:', err);
          console.warn('⚠️ Cambiando a modo POLLING...');
          setUsePolling(true);
        }
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime ACTIVO (solo tus tareas)');
          setUsePolling(false);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('⚠️ Realtime falló, usando POLLING');
          setUsePolling(true);
        }
      });

    // Polling como fallback
    let pollingInterval: NodeJS.Timeout;
    
    const pollingTimeout = setTimeout(() => {
      if (usePolling) {
        console.log('🔄 Iniciando polling cada 3 segundos...');
        pollingInterval = setInterval(() => {
          console.log('🔄 Recargando tus tareas (polling)...');
          loadPersonalTasks(username);
        }, 3000);
      }
    }, 3000);

    return () => {
      console.log('🔌 Limpiando conexiones...');
      supabase.removeChannel(channel);
      clearTimeout(pollingTimeout);
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [usePolling]);

  const handleRealtimeUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newTask = {
        ...payload.new,
        subtasks: Array.isArray(payload.new.subtasks) ? payload.new.subtasks : [],
        expanded: false
      };
      setTasks(prev => {
        if (prev.some(t => t.id === newTask.id)) return prev;
        return [newTask, ...prev];
      });
    } else if (payload.eventType === 'UPDATE') {
      setTasks(prev => prev.map(task => {
        if (task.id === payload.new.id) {
          return {
            ...payload.new,
            subtasks: Array.isArray(payload.new.subtasks) ? payload.new.subtasks : [],
            expanded: task.expanded
          };
        }
        return task;
      }));
    } else if (payload.eventType === 'DELETE') {
      setTasks(prev => prev.filter(task => task.id !== payload.old.id));
    }
  };

  // FILTRO CRÍTICO: Solo cargar tareas del usuario actual
  const loadPersonalTasks = async (username: string) => {
    try {
      console.log('🔍 Cargando tareas de:', username);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('created_by', username) // FILTRO POR USUARIO
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ Error al cargar tareas:", error);
        return;
      }

      console.log(`✅ Tareas cargadas: ${data?.length || 0}`);

      setTasks((prevTasks) => {
        const expandedMap = new Map(prevTasks.map(t => [t.id, t.expanded]));
        
        return (data || []).map(task => ({
          ...task,
          subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
          expanded: expandedMap.get(task.id) ?? false
        }));
      });
    } catch (err) {
      console.error("💥 Error inesperado:", err);
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

    const newTask: Task = {
      id: `${Date.now()}-${Math.random()}`,
      text: newTaskText,
      completed: false,
      subtasks: [],
      expanded: false,
      created_by: currentUser, // ASIGNAR AL USUARIO ACTUAL
      created_at: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskText("");
    setShowAddTask(false);

    try {
      const { error } = await supabase.from('tasks').insert([newTask]);
      
      if (error) {
        console.error("Error:", error);
        setTasks(prev => prev.filter(t => t.id !== newTask.id));
        toast({
          title: "Error",
          description: "No se pudo crear la tarea",
          variant: "destructive"
        });
      } else {
        toast({
          title: "✅ Tarea creada",
          description: "Tu tarea personal se ha agregado correctamente",
        });
      }
    } catch (err) {
      console.error("Error:", err);
      setTasks(prev => prev.filter(t => t.id !== newTask.id));
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

    const newSubtask: Subtask = {
      id: `${Date.now()}-${Math.random()}`,
      text: subtaskText,
      completed: false
    };

    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, subtasks: [...t.subtasks, newSubtask] }
        : t
    ));
    setNewSubtaskText({ ...newSubtaskText, [taskId]: "" });

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ subtasks: [...task.subtasks, newSubtask] })
        .eq('id', taskId)
        .eq('created_by', currentUser); // VERIFICAR PROPIEDAD

      if (error) {
        console.error("Error:", error);
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { ...t, subtasks: task.subtasks }
            : t
        ));
        toast({
          title: "Error",
          description: "No se pudo crear la subtarea",
          variant: "destructive"
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

    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, completed: newCompleted, subtasks: updatedSubtasks }
        : t
    ));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: newCompleted, subtasks: updatedSubtasks })
        .eq('id', taskId)
        .eq('created_by', currentUser); // VERIFICAR PROPIEDAD

      if (error) {
        console.error("Error:", error);
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { ...t, completed: task.completed, subtasks: task.subtasks }
            : t
        ));
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

    const allSubtasksComplete = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);

    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, subtasks: updatedSubtasks, completed: allSubtasksComplete }
        : t
    ));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ subtasks: updatedSubtasks, completed: allSubtasksComplete })
        .eq('id', taskId)
        .eq('created_by', currentUser); // VERIFICAR PROPIEDAD

      if (error) {
        console.error("Error:", error);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const deleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('created_by', currentUser); // VERIFICAR PROPIEDAD
      
      if (error) {
        console.error("Error:", error);
        setTasks(prev => [...prev, taskToDelete]);
        toast({
          title: "Error",
          description: "No se pudo eliminar la tarea",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const oldSubtasks = task.subtasks;
    const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);

    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, subtasks: updatedSubtasks }
        : t
    ));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ subtasks: updatedSubtasks })
        .eq('id', taskId)
        .eq('created_by', currentUser); // VERIFICAR PROPIEDAD

      if (error) {
        console.error("Error:", error);
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { ...t, subtasks: oldSubtasks }
            : t
        ));
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const toggleExpanded = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task =>
        task.id === taskId ? { ...task, expanded: !task.expanded } : task
      )
    );
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
            ? "bg-gray-900/50 border-gray-700" 
            : "bg-gray-800 border-gray-700 hover:border-gray-600"
        }`}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => toggleTaskComplete(task.id)}
            className="mt-1"
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-sm ${task.completed ? "line-through text-gray-500" : "text-gray-200"}`}>
                {task.text}
              </p>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                {task.subtasks.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(task.id)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
                  >
                    {task.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                )}
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

            {progress && (
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all" 
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <span>{progress.completed}/{progress.total}</span>
              </div>
            )}
          </div>
        </div>

        {task.expanded && task.subtasks.length > 0 && (
          <div className="ml-9 mt-3 space-y-2 pl-3 border-l-2 border-gray-700">
            {task.subtasks.map(subtask => (
              <div key={subtask.id} className="flex items-center gap-2">
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={() => toggleSubtaskComplete(task.id, subtask.id)}
                  className="h-3.5 w-3.5"
                />
                <p className={`text-xs flex-1 ${subtask.completed ? 
                  "line-through text-gray-500" : 
                  "text-gray-300"}`}>
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
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#F7DC6F] flex items-center justify-center">
            <User className="h-5 w-5 text-black" />
          </div>
          <div>
            <CardTitle className="text-white">Mis Tareas</CardTitle>
            <p className="text-xs text-gray-400 mt-0.5">
              Panel personal de {currentUser}
            </p>
          </div>
        </div>
        {!showAddTask ? (
          <Button
            onClick={() => setShowAddTask(true)}
            size="sm"
            className="bg-[#F7DC6F] hover:bg-[#F7DC6F]/90 text-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
        ) : (
          <Button
            onClick={() => setShowAddTask(false)}
            size="sm"
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            Cancelar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {showAddTask && (
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="¿Qué necesitas hacer?"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
              className="bg-white"
              autoFocus
            />
            <Button
              onClick={addTask}
              className="bg-[#F7DC6F] hover:bg-[#F7DC6F]/90 text-black flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {/* Tareas Pendientes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              📋 Pendientes
              <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">
                {pendingTasks.length}
              </span>
            </h3>
            <div className="space-y-2">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-700 rounded-lg h-32 flex flex-col items-center justify-center">
                  <p>¡Excelente! No tienes tareas pendientes</p>
                  <p className="text-xs text-gray-600 mt-1">Haz clic en "Nueva Tarea" para agregar una</p>
                </div>
              ) : (
                pendingTasks.map(renderTask)
              )}
            </div>
          </div>

          {/* Tareas Completadas */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              ✅ Completadas
              <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">
                {completedTasks.length}
              </span>
            </h3>
            <div className="space-y-2">
              {completedTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-700 rounded-lg h-32 flex flex-col items-center justify-center">
                  <p>Aún no has completado tareas</p>
                </div>
              ) : (
                completedTasks.map(renderTask)
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            🔒 Solo tú puedes ver y editar estas tareas. 
            <span className="ml-2">
              {usePolling ? (
                <span className="text-yellow-400">🔄 Modo Polling (recarga cada 3s)</span>
              ) : (
                <span className="text-green-400">⚡ Actualizaciones en tiempo real</span>
              )}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalTaskManager;