'use client';

import { Task, TaskStatus } from '@/types/task';
import { updateTaskStatus } from '@/actions/tasks';
import { useState, useTransition, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ListTodo, CircleDashed, CheckCircle2, Timer, Clock, ChevronRight, MessageSquareText } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tempStatus, setTempStatus] = useState<TaskStatus | null>(null);
  const [comment, setComment] = useState('');

  // Pesos para ordenação por prioridade
  const priorityWeights: Record<string, number> = {
    'Urgente': 4,
    'Alta': 3,
    'Média': 2,
    'Baixa': 1
  };

  // Ordenação inteligente: Pendentes/Parciais primeiro (ordenados por prioridade), seguidos pelas Concluídas.
  const sortedTasks = [...tasks].sort((a, b) => {
    // 1. Separar concluídas (vão para o fim)
    const aIsCompleted = a.status === 'Concluída' ? 1 : 0;
    const bIsCompleted = b.status === 'Concluída' ? 1 : 0;
    if (aIsCompleted !== bIsCompleted) {
      return aIsCompleted - bIsCompleted;
    }

    // 2. Ordenar por prioridade (Maior peso primeiro)
    const aWeight = priorityWeights[a.prioridade || 'Média'] || 2;
    const bWeight = priorityWeights[b.prioridade || 'Média'] || 2;
    if (aWeight !== bWeight) {
      return bWeight - aWeight;
    }

    // 3. Ordenar por data de criação (Mais recente primeiro)
    const aTime = a.data_criacao ? new Date(a.data_criacao).getTime() : 0;
    const bTime = b.data_criacao ? new Date(b.data_criacao).getTime() : 0;
    return bTime - aTime;
  });

  useEffect(() => {
    if (selectedTask) {
      setTempStatus(selectedTask.status);
      setComment(selectedTask.comentario || '');
    }
  }, [selectedTask]);

  const handleStatusUpdate = () => {
    if (!selectedTask || !tempStatus) return;
    
    startTransition(async () => {
      await updateTaskStatus(selectedTask.id, tempStatus, tempStatus === 'Parcial' ? comment : undefined);
      setSelectedTask(null);
    });
  };

  const onQuickComplete = (id: string, status: TaskStatus) => {
    startTransition(async () => {
      await updateTaskStatus(id, status);
    });
  };

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
      {sortedTasks.map((task) => (
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
               onClick={(e) => e.stopPropagation()}
             >
               <Checkbox 
                  id={`task-${task.id}`}
                  checked={task.status === 'Concluída'}
                  onCheckedChange={() => onQuickComplete(task.id, 'Concluída')}
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
                <div className="flex items-center gap-2.5 flex-wrap text-[10px] md:text-xs font-black text-muted-foreground/40 uppercase tracking-[0.15em]">
                   <span className="flex items-center gap-1 shrink-0">
                      {formatDate(task.data)}
                   </span>
                   {task.status !== 'Pendente' && (
                      <span className={cn(
                        "flex items-center gap-1 shrink-0",
                        task.status === 'Concluída' ? "text-green-500" : "text-orange-500"
                      )}>
                         • {task.status}
                      </span>
                   )}
                   {task.prioridade && (
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0",
                        task.prioridade === 'Urgente' && "bg-red-500/10 text-red-500 border-red-500/10 dark:bg-red-500/20",
                        task.prioridade === 'Alta' && "bg-orange-500/10 text-orange-500 border-orange-500/10 dark:bg-orange-500/20",
                        task.prioridade === 'Média' && "bg-blue-500/10 text-blue-500 border-blue-500/10 dark:bg-blue-500/20",
                        task.prioridade === 'Baixa' && "bg-slate-500/10 text-slate-500 border-slate-500/10 dark:bg-slate-500/20"
                      )}>
                        {task.prioridade}
                      </span>
                    )}
                   {task.comentario && (
                     <span className="flex items-center gap-1 text-primary shrink-0">
                        <MessageSquareText className="h-3 w-3" />
                        Comentário
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
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-6 gap-6 border-none shadow-3xl overscroll-behavior-contain max-h-[95vh] overflow-y-auto">
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

          <div className="grid gap-2">
            {[
              { id: 'Pendente', icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted/50', label: 'Pendente' },
              { id: 'Parcial', icon: Timer, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Parcial' },
              { id: 'Concluída', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Concluída' },
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => setTempStatus(status.id as TaskStatus)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group/btn text-left",
                  tempStatus === status.id 
                    ? "border-primary bg-primary/5" 
                    : "border-transparent bg-muted/20 hover:border-primary/20 hover:bg-background"
                )}
              >
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover/btn:scale-110", status.bg, status.color)}>
                  <status.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm uppercase tracking-widest">{status.label}</p>
                </div>
                {tempStatus === status.id && (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                )}
              </button>
            ))}
          </div>

          {tempStatus === 'Parcial' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 px-1">Comentário Do Parcial</label>
              <Textarea 
                placeholder="Explique o que foi feito ou o que falta…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="rounded-2xl border-none bg-muted/40 focus-visible:bg-background h-24 font-medium"
              />
            </div>
          )}

          <DialogFooter className="flex flex-col gap-2">
            <Button 
              className="w-full h-14 rounded-2xl text-base font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-transform active:scale-95"
              onClick={handleStatusUpdate}
              disabled={isPending || (tempStatus === 'Parcial' && !comment.trim())}
            >
              {isPending ? 'Salvando…' : 'Confirmar'}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] opacity-50"
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
