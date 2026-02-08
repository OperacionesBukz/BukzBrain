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
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

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

const TaskManager = () => {
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
  
  // Protección contra actualizaciones Realtime mientras se edita
  const [focusedFieldId, setFocusedFieldId] = useState<string | null>(null);
  const [localEdits, setLocalEdits] = useState<{ [taskId: string]: { notes?: string } }>({});
  
  // Refs para debounce y canal Realtime
  const saveTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const channelRef = useRef<any>(null);
  
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
    
    // Carga inicial
    loadTasks(username);
    
    // Configurar Supabase Realtime
    setupRealtimeSubscription(username);
    
    return () => {
      // Limpiar suscripción
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      // Limpiar timers
      Object.values(saveTimersRef.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const loadTasks = async (username?: string) => {
    try {
      console.log("📥 Carga inicial de tareas compartidas");
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ Error:", error);
        return;
      }

      const tasksWithDefaults = (data || []).map(task => ({
        ...task,
        notes: task.notes || "",
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
        order: task.order || 0
      }));

      setTasks(tasksWithDefaults);
      console.log("✅ Tareas compartidas cargadas:", tasksWithDefaults.length);
    } catch (err) {
      console.error("❌ Error:", err);
    }
  };

  const setupRealtimeSubscription = (username: string) => {
    console.log("🔌 Configurando Realtime para tareas compartidas...");
    
    const channel = supabase
      .channel('tasks_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
          // SIN FILTRO - Compartidas por todos
        },
        (payload: RealtimePostgresChangesPayload<Task>) => {
          console.log("🔥 Cambio Realtime:", payload.eventType);
          handleRealtimeChange(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log("✅ Realtime activo para Operaciones");
        }
      });

    channelRef.current = channel;
  };

  const handleRealtimeChange = (payload: RealtimePostgresChangesPayload<Task>) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT' && newRecord) {
      setTasks(prev => {
        if (prev.some(t => t.id === newRecord.id)) return prev;
        return [{ ...newRecord, subtasks: newRecord.subtasks || [] }, ...prev];
      });
    } else if (eventType === 'UPDATE' && newRecord) {
      setTasks(prev => prev.map(task => {
        if (task.id !== newRecord.id) return task;
        
        // PROTECCIÓN: No sobrescribir campo activo
        if (focusedFieldId === `notes-${newRecord.id}`) {
          return {
            ...newRecord,
            notes: localEdits[newRecord.id]?.notes ?? newRecord.notes,
            subtasks: newRecord.subtasks || []
          };
        }
        
        return { ...newRecord, subtasks: newRecord.subtasks || [] };
      }));
    } else if (eventType === 'DELETE' && oldRecord) {
      setTasks(prev => prev.filter(task => task.id !== oldRecord.id));
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

    // OPTIMISTIC UI
    if (activeTask.completed !== overTask.completed) {
      setTasks(prev => prev.map(t => 
        t.id === activeTask.id ? { ...t, completed: overTask.completed } : t
      ));

      try {
        await supabase
          .from('tasks')
          .update({ completed: overTask.completed })
          .eq('id', activeTask.id)
          .eq('created_by', currentUser);
      } catch (err) {
        console.error("Error:", err);
        setTasks(prev => prev.map(t => 
          t.id === activeTask.id ? { ...t, completed: activeTask.completed } : t
        ));
      }
    } else {
      const taskList = tasks.filter(t => t.completed === activeTask.completed);
      const oldIndex = taskList.findIndex(t => t.id === active.id);
      const newIndex = taskList.findIndex(t => t.id === over.id);

      if (oldIndex !== newIndex) {
        const reordered = [...taskList];
        const [removed] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, removed);

        const otherTasks = tasks.filter(t => t.completed !== activeTask.completed);
        const newTaskList = reordered.map((task, index) => ({ ...task, order: index }));
        setTasks([...newTaskList, ...otherTasks].sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          return (a.order || 0) - (b.order || 0);
        }));

        try {
          for (const [index, task] of reordered.entries()) {
            await supabase
              .from('tasks')
              .update({ order: index })
              .eq('id', task.id)
              .eq('created_by', currentUser);
          }
        } catch (err) {
          console.error("Error:", err);
        }
      }
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) return;
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

    // OPTIMISTIC UI
    setTasks(prev => [newTask, ...prev]);
    setNewTaskText("");

    try {
      const { error } = await supabase
        .from('tasks')
        .insert([newTask]);
      
      if (error) {
        setTasks(prev => prev.filter(t => t.id !== newTask.id));
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "✅ Tarea creada" });
      }
    } catch (err) {
      setTasks(prev => prev.filter(t => t.id !== newTask.id));
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskText = async (taskId: string, newText: string) => {
    if (!newText.trim()) return;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, text: newText } : t));
    setEditingTaskId(null);

    try {
      await supabase
        .from('tasks')
        .update({ text: newText })
        .eq('id', taskId)
        .eq('created_by', currentUser);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const debouncedSaveNotes = (taskId: string, notes: string) => {
    if (saveTimersRef.current[`notes-${taskId}`]) {
      clearTimeout(saveTimersRef.current[`notes-${taskId}`]);
    }

    saveTimersRef.current[`notes-${taskId}`] = setTimeout(async () => {
      try {
        await supabase
          .from('tasks')
          .update({ notes })
          .eq('id', taskId)
          .eq('created_by', currentUser);
        
        console.log("✅ Notas guardadas (debounce)");
      } catch (err) {
        console.error("Error:", err);
      }
      delete saveTimersRef.current[`notes-${taskId}`];
    }, 1500);
  };

  const handleNotesChange = (taskId: string, value: string) => {
    setLocalEdits(prev => ({ ...prev, [taskId]: { notes: value } }));
    debouncedSaveNotes(taskId, value);
  };

  const handleNotesFocus = (taskId: string) => {
    setFocusedFieldId(`notes-${taskId}`);
  };

  const handleNotesBlur = async (taskId: string, value: string) => {
    setFocusedFieldId(null);
    
    if (saveTimersRef.current[`notes-${taskId}`]) {
      clearTimeout(saveTimersRef.current[`notes-${taskId}`]);
    }

    try {
      await supabase
        .from('tasks')
        .update({ notes: value })
        .eq('id', taskId)
        .eq('created_by', currentUser);
      
      setLocalEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits[taskId];
        return newEdits;
      });
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const addSubtask = async (taskId: string, subtaskText: string) => {
    if (!subtaskText.trim()) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubtask: Subtask = {
      id: `subtask_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      text: subtaskText,
      completed: false
    };

    const updatedSubtasks = [...task.subtasks, newSubtask];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t));

    try {
      await supabase
        .from('tasks')
        .update({ subtasks: updatedSubtasks })
        .eq('id', taskId)
        .eq('created_by', currentUser);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const updateSubtaskText = async (taskId: string, subtaskId: string, newText: string) => {
    if (!newText.trim()) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, text: newText } : st
    );

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t));
    setEditingSubtaskId(null);

    try {
      await supabase
        .from('tasks')
        .update({ subtasks: updatedSubtasks })
        .eq('id', taskId)
        .eq('created_by', currentUser);
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

    const allComplete = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);

    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, subtasks: updatedSubtasks, completed: allComplete } : t
    ));

    try {
      await supabase
        .from('tasks')
        .update({ subtasks: updatedSubtasks, completed: allComplete })
        .eq('id', taskId)
        .eq('created_by', currentUser);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t));

    try {
      await supabase
        .from('tasks')
        .update({ subtasks: updatedSubtasks })
        .eq('id', taskId)
        .eq('created_by', currentUser);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: newCompleted } : t));

    try {
      await supabase
        .from('tasks')
        .update({ completed: newCompleted })
        .eq('id', taskId)
        .eq('created_by', currentUser);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const deleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('created_by', currentUser);
      
      if (error && taskToDelete) {
        setTasks(prev => [...prev, taskToDelete]);
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
    const notesValue = localEdits[task.id]?.notes ?? task.notes;

    return (
      <div className={`border rounded-lg p-3 transition-all ${
        task.completed ? "bg-[#1a1a1a] border-[#2a2a2a]" : "bg-[#0f0f0f] border-[#2a2a2a] hover:border-[#3a3a3a]"
      }`}>
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
                <Button size="sm" onClick={() => updateTaskText(task.id, editingText)} className="h-8 bg-green-600 hover:bg-green-700">
                  <Save className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingTaskId(null)} className="h-8">
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
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${progress.percentage}%` }} />
                </div>
                <span>{progress.completed}/{progress.total}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">Por: {task.created_by}</span>
              {task.subtasks.length > 0 && (
                <span className="text-gray-400">
                  • {task.subtasks.length} subtarea{task.subtasks.length !== 1 ? 's' : ''}
                </span>
              )}
              {task.notes && (
                <span className="flex items-center gap-1 text-yellow-400">
                  • <StickyNote className="h-3 w-3" /> Notas
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={() => toggleExpanded(task.id)} className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)} className="h-6 w-6 p-0 text-red-400 hover:text-red-300">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="ml-0 mt-3 space-y-3 pl-3 border-l-2 border-[#2a2a2a]">
            <div>
              <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
                <StickyNote className="h-3 w-3" />
                Notas (guardado automático 1.5s)
              </label>
              <textarea
                value={notesValue}
                onFocus={() => handleNotesFocus(task.id)}
                onChange={(e) => handleNotesChange(task.id, e.target.value)}
                onBlur={(e) => handleNotesBlur(task.id, e.target.value)}
                placeholder="Agrega notas..."
                className="w-full bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm min-h-[60px] p-2 rounded-md border border-gray-300 dark:border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#F7DC6F] resize-y"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Subtareas</label>
              
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
                              if (e.key === "Enter") updateSubtaskText(task.id, subtask.id, editingSubtaskText);
                            }}
                            className="bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 text-xs h-7"
                            autoFocus
                          />
                          <Button size="sm" onClick={() => updateSubtaskText(task.id, subtask.id, editingSubtaskText)} className="h-7 px-2 bg-green-600 hover:bg-green-700">
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingSubtaskId(null)} className="h-7 px-2">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className={`text-xs flex-1 ${subtask.completed ? "line-through text-gray-500" : "text-gray-300"}`}>
                            {subtask.text}
                          </p>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setEditingSubtaskId(subtask.id);
                            setEditingSubtaskText(subtask.text);
                          }} className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300">
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteSubtask(task.id, subtask.id)} className="h-6 w-6 p-0 text-red-400 hover:text-red-300">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

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
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <Card className="bg-[#0f0f0f] border-[#2a2a2a]">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">Tareas de Operaciones</CardTitle>
            <p className="text-xs text-gray-400 mt-1">
              👥 Compartidas • ⚡ Realtime • 📝 Debounce 1.5s • 🎯 Optimistic UI
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="¿Qué necesita hacer el equipo?"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isLoading && addTask()}
                className="bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                disabled={isLoading}
              />
              <Button onClick={addTask} disabled={isLoading} className="bg-[#F7DC6F] hover:bg-[#F7DC6F]/90 text-black flex-shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                {isLoading ? "Guardando..." : "Agregar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#0f0f0f] border-[#2a2a2a]">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                En Proceso
                <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                  {pendingTasks.length}
                </span>
              </CardTitle>
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
              <CardTitle className="text-white text-lg flex items-center gap-2">
                Finalizadas
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                  {completedTasks.length}
                </span>
              </CardTitle>
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

export default TaskManager;