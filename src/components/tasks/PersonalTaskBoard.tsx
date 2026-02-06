import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface PersonalTask {
  id: string;
  text: string;
  completed: boolean;
  created_by: string;
  created_at: string;
}

const PersonalTaskBoard = () => {
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const username = localStorage.getItem("username") || "Usuario";
    setCurrentUser(username);
    loadPersonalTasks(username);

    // Realtime subscription para tareas personales
    const channel = supabase
      .channel('personal-tasks-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'personal_tasks',
          filter: `created_by=eq.${username}`
        },
        (payload) => {
          console.log('🔥 Cambio en tareas personales:', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRealtimeUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setTasks(prev => {
        if (prev.some(t => t.id === payload.new.id)) return prev;
        return [payload.new, ...prev];
      });
    } else if (payload.eventType === 'UPDATE') {
      setTasks(prev => prev.map(task => 
        task.id === payload.new.id ? payload.new : task
      ));
    } else if (payload.eventType === 'DELETE') {
      setTasks(prev => prev.filter(task => task.id !== payload.old.id));
    }
  };

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

      setTasks(data || []);
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

    const newTask: PersonalTask = {
      id: `${Date.now()}-${Math.random()}`,
      text: newTaskText,
      completed: false,
      created_by: currentUser,
      created_at: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskText("");

    try {
      const { error } = await supabase.from('personal_tasks').insert([newTask]);
      
      if (error) {
        console.error("Error:", error);
        setTasks(prev => prev.filter(t => t.id !== newTask.id));
        toast({
          title: "Error",
          description: "No se pudo crear la tarea",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Error:", err);
      setTasks(prev => prev.filter(t => t.id !== newTask.id));
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;

    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: newCompleted } : t
    ));

    try {
      const { error } = await supabase
        .from('personal_tasks')
        .update({ completed: newCompleted })
        .eq('id', taskId)
        .eq('created_by', currentUser);

      if (error) {
        console.error("Error:", error);
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, completed: task.completed } : t
        ));
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
        .from('personal_tasks')
        .delete()
        .eq('id', taskId)
        .eq('created_by', currentUser);
      
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

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const TaskCard = ({ task }: { task: PersonalTask }) => (
    <div
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
          <p className={`text-sm ${task.completed ? "line-through text-gray-500" : "text-gray-200"}`}>
            {task.text}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteTask(task.id)}
          className="h-6 w-6 p-0 text-red-400 hover:text-red-300 flex-shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header con input */}
      <Card className="bg-[#161A15] border-[#161A15]">
        <CardHeader className="pb-4">
          <CardTitle className="text-white">Mis Tareas Personales</CardTitle>
          <p className="text-xs text-gray-400 mt-1">
            🔒 Solo tú puedes ver estas tareas
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="¿Qué necesitas hacer?"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
              className="bg-white"
            />
            <Button
              onClick={addTask}
              className="bg-[#F7DC6F] hover:bg-[#F7DC6F]/90 text-black flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar
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
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm border border-dashed border-gray-700 rounded-lg">
                  <p>No hay tareas pendientes</p>
                  <p className="text-xs text-gray-600 mt-1">¡Buen trabajo! 🎉</p>
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
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
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
