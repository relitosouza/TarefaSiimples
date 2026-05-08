'use client';

import { Task, TaskStatus } from '@/types/task';
import { updateTaskStatus } from '@/actions/tasks';
import { useState, useTransition } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Check, Clock, ChevronRight, ListTodo, CircleDashed, CheckCircle2, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const onStatusChange = (id: string, status: TaskStatus) => {
    startTransition(async () => {
      await updateTaskStatus(id, status);
      setSelectedTask(null);
    });
  };

  const pendingTasks = tasks.filter(t => t.status !== 'Concluída');

  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-[3rem] opacity-50 flex flex-col items-center">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <ListTodo className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-1">Tudo Pronto!</h3>
        <p className="text-sm max-w-xs mx-auto font-medium">Você não tem tarefas registradas. Adicione uma para começar.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4" role="list" aria-label="Lista de Tarefas">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          role="listitem"
          className={cn(
            "group flex items-center justify-between p-4 md:p-5 bg-card border rounded-[2rem] transition-all hover:border-primary/30 hover:shadow-md cursor-pointer active:scale-[0.98]",
            task.status === 'Parcial' && "border-l-4 border-l-orange-500",
            task.status === 'Concluída' && "opacity-75"
          )}
          onClick={() => setSelectedTask(task)}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
             <div 
               className="relative flex items-center justify-center"
               onClick={(e) => e.stopPropagation()} // Prevent modal when clicking checkbox
             >
               <Checkbox 
                  id={`task-${task.id}`}
                  checked={task.status === 'Concluída'}
                  onCheckedChange={() => onStatusChange(task.id, 'Concluída')}
                  disabled={isPending}
                  className="h-8 w-8 md:h-7 md:w-7 rounded-full border-2"
                  aria-label={`Marcar "${task.tarefa}" como concluída`}
               />
             </div>
             <div className="space-y-1 min-w-0 flex-1">
                <p 
                  className={cn(
                    "text-base md:text-xl font-bold tracking-tight transition-colors group-hover:text-primary truncate",
                    task.status === 'Concluída' && "line-through opacity-40 decoration-2"
                  )}
                >
                  {task.tarefa}
                </p>
                <div className="flex items-center gap-3 text-[10px] md:text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                   <span className="flex items-center gap-1">
                      {formatDate(task.data)}
                   </span>
                   {task.status !== 'Pendente' && (
                      <span className={cn(
                        "flex items-center gap-1",
                        task.status === 'Concluída' ? "text-green-500" : "text-orange-500"
                      )}>
                         • {task.status}
                      </span>
                   )}
                </div>
             </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
        </div>
      ))}

      {/* Modal de Status da Tarefa */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-6 gap-6 border-none shadow-3xl overscroll-behavior-contain">
          <DialogHeader className="space-y-4">
            <div className="bg-primary/5 w-12 h-12 rounded-2xl flex items-center justify-center text-primary">
              <CircleDashed className="h-6 w-6 animate-spin-slow" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black tracking-tighter text-wrap-balance">
                Atualizar Status
              </DialogTitle>
              <DialogDescription className="text-base font-medium">
                Defina o progresso atual para: <span className="text-foreground font-bold italic underline decoration-primary/30">"{selectedTask?.tarefa}"</span>
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid gap-3">
            {[
              { id: 'Pendente', icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted/50', label: 'Pendente' },
              { id: 'Parcial', icon: Timer, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Em Andamento (Parcial)' },
              { id: 'Concluída', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Concluída' },
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => selectedTask && onStatusChange(selectedTask.id, status.id as TaskStatus)}
                disabled={isPending}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group/btn text-left",
                  selectedTask?.status === status.id 
                    ? "border-primary bg-primary/5" 
                    : "border-transparent bg-muted/20 hover:border-primary/20 hover:bg-background"
                )}
              >
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover/btn:scale-110", status.bg, status.color)}>
                  <status.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm uppercase tracking-widest">{status.label}</p>
                  <p className="text-xs text-muted-foreground truncate">Toque para selecionar</p>
                </div>
                {selectedTask?.status === status.id && (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                )}
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button 
              variant="ghost" 
              className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs opacity-50"
              onClick={() => setSelectedTask(null)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
