import { useState, useEffect, useCallback, useRef, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ChevronDown, ChevronRight, CheckCircle2, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

// ============================================
// TIPOS
// ============================================
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

// ============================================
// COMPONENTE DE TAREA INDIVIDUAL (MEMOIZADO)
// ============================================
interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onToggleExpanded: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtaskComplete: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onFocusChange: (taskId: string, isFocused: boolean) => void;
}

const TaskItem = memo(({
  task,
  onToggleComplete,
  onToggleExpanded,
  onDelete,
  onToggleSubtaskComplete,
  onDeleteSubtask,
  onAddSubtask,
  onFocusChange,
}: TaskItemProps) => {
  const [newSubtaskText, setNewSubtaskText] = useState("");

  const handleAddSubtask = useCallback(() => {
    if (newSubtaskText.trim()) {
      onAddSubtask(task.id, newSubtaskText.trim());
      setNewSubtaskText("");
    }
  }, [task.id, newSubtaskText, onAddSubtask]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddSubtask();
    }
  }, [handleAddSubtask]);

  const progress = task.subtasks.length > 0 ? {
    completed: task.subtasks.filter(st => st.completed).length,
    total: task.subtasks.length,
    percentage: Math.round((task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100)
  } : null;

  return (
    <div
      className={`border rounded-lg p-3 transition-all ${
        task.completed 
          ? "bg-green-900/20 border-green-700/50" 
          : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
      }`}
    >
      {/* Task Header */}
      <div className="flex items-start gap-3">
        <Checkbox 
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={`font-medium ${task.completed ? "text-green-400 line-through" : "text-white"}`}>
              {task.text}
            </p>
            <div className="flex items-center gap-1 ml-2">
              {progress && (
                <span className="text-xs text-gray-400 mr-2">
                  {progress.completed}/{progress.total}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleExpanded(task.id)}
                className="h-7 w-7 p-0 text-gray-400 hover:text-white"
              >
                {task.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          {progress && (
            <div className="mt-2">
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            Por: {task.created_by}
          </p>
        </div>
      </div>

      {/* Subtasks */}
      {task.expanded && (
        <div className="mt-3 pl-8 space-y-2">
          {task.subtasks.map((subtask) => (
            <div 
              key={subtask.id}
              className="flex items-center gap-2 py-1"
            >
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={() => onToggleSubtaskComplete(task.id, subtask.id)}
                className="h-4 w-4"
              />
              <p className={`text-sm flex-1 ${subtask.completed ? "text-green-400 font-medium" : "text-gray-300"}`}>
                {subtask.text}
              </p>
              {subtask.completed && <CheckCircle2 className="h-3 w-3 text-green-400" />}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteSubtask(task.id, subtask.id)}
                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {/* Add Subtask */}
          <div className="flex gap-2 mt-2 pt-2 border-t border-gray-700">
            <Input
              placeholder="Agregar subtarea..."
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => onFocusChange(task.id, true)}
              onBlur={() => onFocusChange(task.id, false)}
              className="bg-white text-sm h-8"
            />
            <Button
              onClick={handleAddSubtask}
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
});

TaskItem.displayName = 'TaskItem';

// ============================================
// COMPONENTE PRINCIPAL: TaskManager
// ============================================
const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const { toast } = useToast();
  
  // Ref para trackear qué tareas están siendo editadas
  const editingTasksRef = useRef<Set<string>>(new Set());

  // Cargar usuario
  useEffect(() => {
    const username = localStorage.getItem("username") || "Usuario";
    setCurrentUser(username);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 INICIANDO TaskManager v2.0 (Realtime + Focus Fix)');
    console.log('👤 Usuario:', username);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    loadTasks();
  }, []);

  // ============================================
  // SUPABASE REALTIME - Integrado directamente
  // ============================================
  useEffect(() => {
    console.log('📡 Iniciando conexión Realtime...');
    setConnectionStatus('connecting');

    const channel = supabase
      .channel('tasks-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          const timestamp = new Date().toLocaleTimeString();
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`🔥 [${timestamp}] REALTIME: ${payload.eventType}`);
          
          // Manejar INSERT
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as Task;
            console.log('➕ Nueva tarea:', newTask.text);
            
            setTasks(prev => {
              // Evitar duplicados
              if (prev.some(t => t.id === newTask.id)) return prev;
              
              return [{
                ...newTask,
                subtasks: Array.isArray(newTask.subtasks) ? newTask.subtasks : [],
                expanded: false
              }, ...prev];
            });
          }
          
          // Manejar UPDATE
          if (payload.eventType === 'UPDATE') {
            const updatedTask = payload.new as Task;
            console.log('📝 Tarea actualizada:', updatedTask.id);
            
            setTasks(prev => prev.map(task => {
              if (task.id !== updatedTask.id) return task;
              
              // Si la tarea está siendo editada, solo actualizamos campos no editables
              if (editingTasksRef.current.has(task.id)) {
                console.log('⚠️ Tarea siendo editada - fusión selectiva');
                return {
                  ...task,
                  completed: updatedTask.completed ?? task.completed,
                  created_by: updatedTask.created_by ?? task.created_by,
                  created_at: updatedTask.created_at ?? task.created_at,
                  // Mantenemos text y subtasks locales
                };
              }
              
              return {
                ...updatedTask,
                subtasks: Array.isArray(updatedTask.subtasks) ? updatedTask.subtasks : [],
                expanded: task.expanded
              };
            }));
          }
          
          // Manejar DELETE
          if (payload.eventType === 'DELETE') {
            const oldTask = payload.old as Partial<Task>;
            console.log('🗑️ Tarea eliminada:', oldTask.id);
            setTasks(prev => prev.filter(task => task.id !== oldTask.id));
          }
          
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
      )
      .subscribe((status, err) => {
        console.log('📊 Estado de suscripción:', status);
        
        if (err) {
          console.error('❌ Error Realtime:', err);
          setConnectionStatus('error');
          setIsConnected(false);
          return;
        }
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime CONECTADO');
          setConnectionStatus('connected');
          setIsConnected(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('⚠️ Problema de conexión:', status);
          setConnectionStatus('error');
          setIsConnected(false);
        } else if (status === 'CLOSED') {
          setConnectionStatus('disconnected');
          setIsConnected(false);
        }
      });

    // Cleanup al desmontar
    return () => {
      console.log('🔌 Limpiando conexión Realtime...');
      supabase.removeChannel(channel);
    };
  }, []);

  // ============================================
  // CARGAR TAREAS INICIAL
  // ============================================
  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error al cargar tareas:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las tareas",
          variant: "destructive"
        });
        return;
      }

      setTasks((prevTasks) => {
        const expandedMap = new Map(prevTasks.map(t => [t.id, t.expanded]));
        
        return (data || []).map(task => ({
          ...task,
          subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
          expanded: expandedMap.get(task.id) ?? false
        }));
      });
      
      console.log('✅ Tareas cargadas:', data?.length || 0);
    } catch (err) {
      console.error("Error inesperado:", err);
    }
  };

  // ============================================
  // MANEJAR CAMBIO DE FOCO
  // ============================================
  const handleFocusChange = useCallback((taskId: string, isFocused: boolean) => {
    if (isFocused) {
      editingTasksRef.current.add(taskId);
      console.log('🔒 Bloqueando actualizaciones Realtime para:', taskId);
    } else {
      editingTasksRef.current.delete(taskId);
      console.log('🔓 Desbloqueando actualizaciones Realtime para:', taskId);
    }
  }, []);

  // ============================================
  // CRUD OPERATIONS
  // ============================================
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
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: newTaskText,
      completed: false,
      subtasks: [],
      expanded: false,
      created_by: currentUser,
      created_at: new Date().toISOString()
    };

    // Actualización optimista
    setTasks(prev => [newTask, ...prev]);
    setNewTaskText("");
    setShowAddTask(false);

    try {
      const { error } = await supabase.from('tasks').insert([{
        id: newTask.id,
        text: newTask.text,
        completed: newTask.completed,
        subtasks: newTask.subtasks,
        created_by: newTask.created_by,
        created_at: newTask.created_at
      }]);
      
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
          description: "La tarea se ha agregado correctamente",
        });
      }
    } catch (err) {
      console.error("Error:", err);
      setTasks(prev => prev.filter(t => t.id !== newTask.id));
    }
  };

  const toggleTaskComplete = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;
    const updatedSubtasks = task.subtasks.map(st => ({ ...st, completed: newCompleted }));

    // Actualización optimista
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, completed: newCompleted, subtasks: updatedSubtasks }
        : t
    ));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: newCompleted, subtasks: updatedSubtasks })
        .eq('id', taskId);

      if (error) {
        console.error("Error:", error);
        // Revertir
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { ...t, completed: task.completed, subtasks: task.subtasks }
            : t
        ));
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }, [tasks]);

  const toggleExpanded = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, expanded: !task.expanded } : task
    ));
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    // Actualización optimista
    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      
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
  }, [tasks, toast]);

  const toggleSubtaskComplete = useCallback(async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    const allSubtasksComplete = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);

    // Actualización optimista
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, subtasks: updatedSubtasks, completed: allSubtasksComplete }
        : t
    ));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ subtasks: updatedSubtasks, completed: allSubtasksComplete })
        .eq('id', taskId);

      if (error) {
        console.error("Error:", error);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }, [tasks]);

  const deleteSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const oldSubtasks = task.subtasks;
    const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);

    // Actualización optimista
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, subtasks: updatedSubtasks }
        : t
    ));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ subtasks: updatedSubtasks })
        .eq('id', taskId);

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
  }, [tasks]);

  const addSubtask = useCallback(async (taskId: string, text: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubtask: Subtask = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      completed: false
    };

    const updatedSubtasks = [...task.subtasks, newSubtask];

    // Actualización optimista
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, subtasks: updatedSubtasks }
        : t
    ));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ subtasks: updatedSubtasks })
        .eq('id', taskId);

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
  }, [tasks, toast]);

  // ============================================
  // RENDER
  // ============================================
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <Card className="mb-6 bg-[#161A15] border-[#161A15]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <CardTitle className="text-white">Tareas Activas</CardTitle>
          {/* Indicador de conexión Realtime */}
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-400" />
                <span className="text-xs text-green-400">En vivo</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-yellow-400">
                  {connectionStatus === 'connecting' ? 'Conectando...' : 'Reconectando...'}
                </span>
              </>
            )}
          </div>
        </div>
        {!showAddTask && (
          <Button 
            onClick={() => setShowAddTask(true)}
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nueva tarea
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Formulario Nueva Tarea */}
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

        {/* Grid de Tareas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pendientes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Pendientes</h3>
              <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                {pendingTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-700 rounded-lg h-32 flex flex-col items-center justify-center">
                  <p>¡No hay tareas pendientes!</p>
                  <p className="text-xs mt-1">Agrega una nueva tarea</p>
                </div>
              ) : (
                pendingTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={toggleTaskComplete}
                    onToggleExpanded={toggleExpanded}
                    onDelete={deleteTask}
                    onToggleSubtaskComplete={toggleSubtaskComplete}
                    onDeleteSubtask={deleteSubtask}
                    onAddSubtask={addSubtask}
                    onFocusChange={handleFocusChange}
                  />
                ))
              )}
            </div>
          </div>

          {/* Completadas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Completadas</h3>
              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                {completedTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {completedTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-700 rounded-lg h-32 flex flex-col items-center justify-center">
                  <p>No hay tareas completadas</p>
                  <p className="text-xs mt-1">Completa algunas tareas</p>
                </div>
              ) : (
                completedTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={toggleTaskComplete}
                    onToggleExpanded={toggleExpanded}
                    onDelete={deleteTask}
                    onToggleSubtaskComplete={toggleSubtaskComplete}
                    onDeleteSubtask={deleteSubtask}
                    onAddSubtask={addSubtask}
                    onFocusChange={handleFocusChange}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskManager;