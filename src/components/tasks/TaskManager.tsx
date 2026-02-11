import { useState, useEffect, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ChevronDown, ChevronRight, CheckCircle2, StickyNote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  notes: string;
  subtasks: Subtask[];
  expanded: boolean;
  created_by: string;
  created_at: string;
  order?: number;
}

interface TaskItemProps {
  task: Task;
  newSubtaskText: string;
  onNewSubtaskTextChange: (taskId: string, value: string) => void;
  onToggleComplete: (taskId: string) => void;
  onToggleExpanded: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtaskComplete: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string) => void;
  onUpdateNotes: (taskId: string, notes: string) => void;
  isOverlay?: boolean;
}

const getSubtaskProgress = (task: Task) => {
  if (task.subtasks.length === 0) return null;
  const completed = task.subtasks.filter(st => st.completed).length;
  const total = task.subtasks.length;
  const percentage = Math.round((completed / total) * 100);
  return { completed, total, percentage };
};

const TaskItemContent = memo(({
  task,
  newSubtaskText,
  onNewSubtaskTextChange,
  onToggleComplete,
  onToggleExpanded,
  onDelete,
  onToggleSubtaskComplete,
  onDeleteSubtask,
  onAddSubtask,
  onUpdateNotes,
  isOverlay,
}: TaskItemProps) => {
  const progress = getSubtaskProgress(task);
  return (
    <>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`dark:text-white text-gray-900 ${task.completed ? "font-semibold dark:line-through" : ""}`}>
              {task.text}
            </p>
            {task.completed && (
              <CheckCircle2 className="h-4 w-4 dark:text-green-400 text-green-600 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs dark:text-gray-400 text-gray-600">
              Por: {task.created_by} • {new Date(task.created_at).toLocaleDateString()}
            </p>
            {task.notes && !task.expanded && (
              <StickyNote className="h-3 w-3 dark:text-yellow-400 text-yellow-600" />
            )}
            {!task.expanded && progress && (
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 dark:bg-gray-700 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F7DC6F] transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <span className="text-xs dark:text-gray-400 text-gray-600">
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
            onClick={() => onToggleExpanded(task.id)}
            className="h-8 w-8 p-0 dark:text-gray-400 dark:hover:text-white text-gray-600 hover:text-gray-900"
          >
            {task.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="h-8 w-8 p-0 dark:text-red-400 dark:hover:text-red-300 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {task.expanded && !isOverlay && (
        <div className="ml-8 mt-3 space-y-3">
          <div className="space-y-1">
            <label className="text-xs dark:text-gray-400 text-gray-600 flex items-center gap-1">
              <StickyNote className="h-3 w-3" />
              Notas
            </label>
            <Textarea
              placeholder="Agregar notas..."
              defaultValue={task.notes}
              onChange={(e) => onUpdateNotes(task.id, e.target.value)}
              className="dark:bg-[#1a1a1a] dark:border-[#3a3a3a] dark:text-white bg-gray-50 border-gray-300 text-gray-900 text-sm min-h-[60px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs dark:text-gray-400 text-gray-600">Subtareas</label>
            {task.subtasks.map(subtask => (
              <div key={subtask.id} className="flex items-center gap-2">
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={() => onToggleSubtaskComplete(task.id, subtask.id)}
                  className="h-4 w-4"
                />
                <p className={`text-sm flex-1 ${subtask.completed ? "dark:text-green-400 dark:line-through text-green-600 line-through" : "dark:text-gray-300 text-gray-700"}`}>
                  {subtask.text}
                </p>
                {subtask.completed && <CheckCircle2 className="h-3 w-3 dark:text-green-400 text-green-600" />}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteSubtask(task.id, subtask.id)}
                  className="h-6 w-6 p-0 dark:text-red-400 dark:hover:text-red-300 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2 mt-2 pt-2 dark:border-[#3a3a3a] border-gray-300 border-t">
              <Input
                placeholder="Agregar subtarea..."
                value={newSubtaskText}
                onChange={(e) => onNewSubtaskTextChange(task.id, e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && onAddSubtask(task.id)}
                className="dark:bg-[#1a1a1a] dark:border-[#3a3a3a] dark:text-white bg-white border-gray-300 text-gray-900 text-sm h-8"
              />
              <Button
                onClick={() => onAddSubtask(task.id)}
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
    </>
  );
});

TaskItemContent.displayName = "TaskItemContent";

const SortableTaskItem = memo((props: TaskItemProps) => {
  const { task } = props;
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
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 0 : "auto" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-3 transition-colors duration-200 select-none touch-none cursor-grab active:cursor-grabbing
        ${isDragging
          ? "dark:bg-[#1a1a1a] dark:border-[#3a3a3a] bg-gray-50 border-gray-200"
          : task.completed
          ? "dark:bg-[#2d2d2d] dark:border-[#2d2d2d] bg-green-50 border-green-200 hover:dark:bg-[#353535] hover:dark:shadow-lg hover:shadow-sm"
          : "dark:bg-[#2d2d2d] dark:border-[#2d2d2d] bg-gray-100 border-gray-300 hover:dark:bg-[#353535] hover:dark:shadow-lg hover:shadow-sm"
        }`}
      {...attributes}
      {...listeners}
    >
      <div onKeyDown={(e) => {
        const tag = (e.target as HTMLElement).tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') {
          e.stopPropagation();
        }
      }}>
        <TaskItemContent {...props} />
      </div>
    </div>
  );
});

SortableTaskItem.displayName = "SortableTaskItem";

const DragOverlayItem = memo((props: TaskItemProps) => (
  <div
    className={`border rounded-lg p-3 shadow-2xl select-none ring-2 ring-blue-500/50
      ${props.task.completed
        ? "dark:bg-[#2d2d2d] dark:border-[#2d2d2d] bg-green-50 border-green-200"
        : "dark:bg-[#2d2d2d] dark:border-[#2d2d2d] bg-gray-100 border-gray-300"
      }`}
    style={{ transform: "scale(1.03)", cursor: "grabbing" }}
  >
    <TaskItemContent {...props} isOverlay />
  </div>
));

DragOverlayItem.displayName = "DragOverlayItem";

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState<{ [key: string]: string }>({});
  const [usePolling, setUsePolling] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const currentUser = user?.username || "Usuario";
  const userId = user?.id || "";

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: {
        start: ['Space'],
        cancel: ['Escape'],
        end: ['Space'],
      },
    })
  );

  useEffect(() => {
    if (!userId) return;

    loadTasks();

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe((status, err) => {
        if (err) {
          setUsePolling(true);
        }

        if (status === 'SUBSCRIBED') {
          setUsePolling(false);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setUsePolling(true);
        }
      });

    let pollingInterval: NodeJS.Timeout;

    const pollingTimeout = setTimeout(() => {
      if (usePolling) {
        pollingInterval = setInterval(() => {
          loadTasks();
        }, 3000);
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearTimeout(pollingTimeout);
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [usePolling, userId]);

  const handleRealtimeUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newTask = {
        ...payload.new,
        notes: payload.new.notes || "",
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
            notes: payload.new.notes || "",
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

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error al cargar tareas:", error);
        return;
      }

      setTasks((prevTasks) => {
        const expandedMap = new Map(prevTasks.map(t => [t.id, t.expanded]));
        
        return (data || []).map(task => ({
          ...task,
          notes: task.notes || "",
          subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
          expanded: expandedMap.get(task.id) ?? false
        }));
      });
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

    const newTask: Task = {
      id: `${Date.now()}-${Math.random()}`,
      text: newTaskText,
      completed: false,
      notes: "",
      subtasks: [],
      expanded: false,
      created_by: currentUser,
      created_at: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskText("");
    setShowAddTask(false);

    try {
      const { error } = await supabase.from('tasks').insert([{ ...newTask, user_id: userId }]);

      if (error) {
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
        .eq('id', taskId);

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
        .eq('id', taskId);

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
  };

  const toggleExpanded = useCallback((taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, expanded: !task.expanded } : task
      )
    );
  }, []);

  const updateNotes = async (taskId: string, notes: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, notes } : t
    ));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ notes })
        .eq('id', taskId);

      if (error) {
        console.error("Error al guardar notas:", error);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const activeTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) : null;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over || active.id === over.id) return;

    const draggedTask = tasks.find(t => t.id === active.id);
    const targetTask = tasks.find(t => t.id === over.id);

    if (!draggedTask || !targetTask) return;

    if (draggedTask.completed !== targetTask.completed) return;

    const relevantTasks = !draggedTask.completed ? pendingTasks : completedTasks;
    const oldIndex = relevantTasks.findIndex(t => t.id === active.id);
    const newIndex = relevantTasks.findIndex(t => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedTasks = arrayMove(relevantTasks, oldIndex, newIndex);

    const newTasks = !draggedTask.completed
      ? [...reorderedTasks, ...completedTasks]
      : [...pendingTasks, ...reorderedTasks];

    const previousTasks = tasks;
    setTasks(newTasks);

    try {
      const orderMap = new Map(newTasks.map((task, index) => [task.id, index]));
      const { error } = await supabase
        .from("tasks")
        .update({ order: orderMap.get(active.id as string) })
        .eq("id", active.id);

      if (error) {
        console.error("Error al guardar orden:", error);
        setTasks(previousTasks);
      }
    } catch (err) {
      console.error("Error:", err);
      setTasks(previousTasks);
    }
  }, [tasks, pendingTasks, completedTasks]);

  const handleDragCancel = useCallback(() => {
    setActiveTaskId(null);
  }, []);

  const handleNewSubtaskTextChange = useCallback((taskId: string, value: string) => {
    setNewSubtaskText(prev => ({ ...prev, [taskId]: value }));
  }, []);

  const taskItemProps = (task: Task) => ({
    task,
    newSubtaskText: newSubtaskText[task.id] || "",
    onNewSubtaskTextChange: handleNewSubtaskTextChange,
    onToggleComplete: toggleTaskComplete,
    onToggleExpanded: toggleExpanded,
    onDelete: deleteTask,
    onToggleSubtaskComplete: toggleSubtaskComplete,
    onDeleteSubtask: deleteSubtask,
    onAddSubtask: addSubtask,
    onUpdateNotes: updateNotes,
  });

  return (
    <Card className="mb-6 dark:bg-[#161A15] dark:border-[#161A15] bg-white border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="dark:text-white text-gray-900">Tareas Activas</CardTitle>
        {!showAddTask ? (
          <Button 
            onClick={() => setShowAddTask(true)}
            size="sm"
            variant="ghost"
            className="dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nueva tarea
          </Button>
        ) : null}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showAddTask && (
          <div className="flex gap-2 pb-4 dark:border-[#3a3a3a] border-gray-300 border-b">
            <Input
              placeholder="Escribe la nueva tarea..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
              className="dark:bg-[#1a1a1a] dark:border-[#3a3a3a] dark:text-white bg-white border-gray-300 text-gray-900 flex-1 focus-visible:ring-0 focus-visible:ring-offset-0"
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 uppercase tracking-wide">Pendientes</h3>
                <span className="text-xs dark:bg-yellow-500/20 dark:text-yellow-300 bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{pendingTasks.length}</span>
              </div>
              <SortableContext items={pendingTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {pendingTasks.length === 0 ? (
                    <div className="text-center py-8 dark:text-gray-500 text-gray-600 text-sm dark:border-[#3a3a3a] border-gray-300 border-dashed rounded-lg h-32 flex flex-col items-center justify-center">
                      <p>¡No hay tareas pendientes!</p>
                      <p className="text-xs mt-1">Agrega una nueva tarea</p>
                    </div>
                  ) : (
                    pendingTasks.map(task => (
                      <SortableTaskItem key={task.id} {...taskItemProps(task)} />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 uppercase tracking-wide">Completadas</h3>
                <span className="text-xs dark:bg-green-500/20 dark:text-green-300 bg-green-100 text-green-800 px-2 py-1 rounded">{completedTasks.length}</span>
              </div>
              <SortableContext items={completedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {completedTasks.length === 0 ? (
                    <div className="text-center py-8 dark:text-gray-500 text-gray-600 text-sm dark:border-[#3a3a3a] border-gray-300 border-dashed rounded-lg h-32 flex flex-col items-center justify-center">
                      <p>Aún no hay tareas completadas</p>
                      <p className="text-xs mt-1">Completa algunas tareas</p>
                    </div>
                  ) : (
                    completedTasks.map(task => (
                      <SortableTaskItem key={task.id} {...taskItemProps(task)} />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          </div>

          <DragOverlay dropAnimation={{
            duration: 250,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}>
            {activeTask ? (
              <DragOverlayItem
                {...taskItemProps(activeTask)}
                newSubtaskText=""
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>

        <div className="pt-4 dark:border-[#3a3a3a] border-gray-300 border-t">
          <p className="text-xs dark:text-gray-500 text-gray-600">
            💡 Click en la flecha (→) para expandir y ver/agregar subtareas y notas. 
            <span className="ml-2">
              {usePolling ? (
                <span className="dark:text-yellow-400 text-yellow-600">🔄 Modo Polling (recarga cada 3s)</span>
              ) : (
                <span className="dark:text-green-400 text-green-600">⚡ En Vivo - Actualizaciones en tiempo real</span>
              )}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskManager;