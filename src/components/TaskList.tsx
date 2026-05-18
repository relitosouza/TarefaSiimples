'use client';

import { Task, TaskStatus } from '@/types/task';
import { updateTaskStatus, updateTask, deleteTask } from '@/actions/tasks';
import { useState, useTransition, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ListTodo, 
  CircleDashed, 
  CheckCircle2, 
  Timer, 
  Clock, 
  ChevronRight, 
  MessageSquareText, 
  Trash2, 
  AlertTriangle,
  FolderCheck,
  CalendarDays,
  Sparkles,
  User
} from 'lucide-react';
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
  const [tempStatus, setTempStatus] = useState<TaskStatus | null>(null);
  const [comment, setComment] = useState('');
  
  // Edit states for CRUD
  const [editTarefa, setEditTarefa] = useState('');
  const [editPrioridade, setEditPrioridade] = useState<'Urgente' | 'Alta' | 'Média' | 'Baixa'>('Média');
  const [editComplexidade, setEditComplexidade] = useState<'Alta' | 'Média' | 'Baixa'>('Média');
  const [editResponsavel, setEditResponsavel] = useState<'Amanda' | 'Bárbara' | 'Daisy' | ''>('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  // Pesos para ordenação por prioridade
  const priorityWeights: Record<string, number> = {
    'Urgente': 4,
    'Alta': 3,
    'Média': 2,
    'Baixa': 1
  };

  // Separação de Ativas vs Concluídas
  const activeTasks = tasks.filter(t => t.status !== 'Concluída').sort((a, b) => {
    // Ordenar por prioridade (Maior peso primeiro)
    const aWeight = priorityWeights[a.prioridade || 'Média'] || 2;
    const bWeight = priorityWeights[b.prioridade || 'Média'] || 2;
    if (aWeight !== bWeight) {
      return bWeight - aWeight;
    }
    // Ordenar por data de criação (Mais recente primeiro)
    const aTime = a.data_criacao ? new Date(a.data_criacao).getTime() : 0;
    const bTime = b.data_criacao ? new Date(b.data_criacao).getTime() : 0;
    return bTime - aTime;
  });

  const completedTasks = tasks.filter(t => t.status === 'Concluída').sort((a, b) => {
    const aTime = a.data_conclusao ? new Date(a.data_conclusao).getTime() : (a.data ? new Date(a.data).getTime() : 0);
    const bTime = b.data_conclusao ? new Date(b.data_conclusao).getTime() : (b.data ? new Date(b.data).getTime() : 0);
    return bTime - aTime;
  });

  // Agrupamento de Concluídas por Data
  const completedGroups: Record<string, Task[]> = {};
  completedTasks.forEach(task => {
    const rawDate = task.data_conclusao 
      ? task.data_conclusao.split('T')[0] 
      : (task.data ? task.data.split('T')[0] : new Date().toISOString().split('T')[0]);
    if (!completedGroups[rawDate]) {
      completedGroups[rawDate] = [];
    }
    completedGroups[rawDate].push(task);
  });

  // Chaves de data ordenadas (Mais recente primeiro)
  const sortedGroupDates = Object.keys(completedGroups).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  useEffect(() => {
    if (selectedTask) {
      setTempStatus(selectedTask.status);
      setComment(selectedTask.comentario || '');
      setEditTarefa(selectedTask.tarefa);
      setEditPrioridade(selectedTask.prioridade || 'Média');
      setEditComplexidade(selectedTask.complexidade || 'Média');
      setEditResponsavel(selectedTask.responsavel || 'Amanda');
      setConfirmDelete(false);
    }
  }, [selectedTask]);

  const handleUpdateTask = () => {
    if (!selectedTask || !editTarefa.trim()) return;
    
    startTransition(async () => {
      await updateTask(selectedTask.id, {
        tarefa: editTarefa,
        prioridade: editPrioridade,
        complexidade: editComplexidade,
        comentario: tempStatus === 'Parcial' ? comment : (tempStatus === 'Concluída' ? '' : comment),
        status: tempStatus || undefined,
        responsavel: editResponsavel || undefined
      });
      setSelectedTask(null);
    });
  };

  const handleDeleteTask = () => {
    if (!selectedTask) return;
    
    startTransition(async () => {
      await deleteTask(selectedTask.id);
      setSelectedTask(null);
    });
  };

  const onQuickComplete = (id: string, status: TaskStatus) => {
    startTransition(async () => {
      await updateTaskStatus(id, status);
    });
  };

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

  const formatGroupHeaderDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      ) {
        return 'Hoje';
      }

      if (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
      ) {
        return 'Ontem';
      }

      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // Renderizador individual de cada card de tarefa
  const renderTaskCard = (task: Task) => {
    return (
      <div 
        key={task.id} 
        role="listitem"
        className={cn(
          "group flex items-center justify-between p-4 md:p-5 bg-card border rounded-[2rem] transition-all hover:border-primary/30 hover:shadow-md cursor-pointer active:scale-[0.98]",
          task.status === 'Parcial' && "border-l-4 border-l-orange-500",
          task.status === 'Concluída' && "opacity-75 bg-slate-50/50 dark:bg-slate-900/30"
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
                onCheckedChange={() => onQuickComplete(task.id, task.status === 'Concluída' ? 'Pendente' : 'Concluída')}
                disabled={isPending}
                className="h-8 w-8 md:h-7 md:w-7 rounded-full border-2"
                aria-label={`Marcar "${task.tarefa}" como concluída`}
             />
           </div>
           <div className="space-y-1 min-w-0 flex-1">
              <p 
                className={cn(
                  "text-base md:text-xl font-bold tracking-tight transition-colors group-hover:text-primary truncate",
                  task.status === 'Concluída' && "line-through opacity-40 decoration-2 text-muted-foreground"
                )}
              >
                {task.tarefa}
              </p>
              <div className="flex items-center gap-2.5 flex-wrap text-[10px] md:text-xs font-black text-muted-foreground/40 uppercase tracking-[0.15em]">
                 <span className="flex items-center gap-1 shrink-0">
                    Criada: {formatDate(task.data_criacao || task.data)}
                 </span>
                 
                 {task.data_conclusao && task.status === 'Concluída' && (
                    <span className="text-green-500 flex items-center gap-1 shrink-0">
                      • Conclusão: {formatDate(task.data_conclusao)}
                    </span>
                 )}

                 {task.status !== 'Pendente' && task.status !== 'Concluída' && (
                    <span className="text-orange-500 shrink-0">
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

                 {task.responsavel && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 flex items-center gap-1",
                      task.responsavel === 'Amanda' && "bg-purple-500/10 text-purple-600 border-purple-500/10 dark:bg-purple-500/20 dark:text-purple-400",
                      task.responsavel === 'Bárbara' && "bg-pink-500/10 text-pink-600 border-pink-500/10 dark:bg-pink-500/20 dark:text-pink-400",
                      task.responsavel === 'Daisy' && "bg-amber-500/10 text-amber-600 border-amber-500/10 dark:bg-amber-500/20 dark:text-amber-400"
                    )}>
                      <User className="h-2 w-2 shrink-0" />
                      {task.responsavel}
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
    );
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

  return (
    <div className="space-y-6">
      {/* Tabs com visual premium */}
      <div className="flex bg-muted/40 p-1.5 rounded-[2rem] border max-w-md mx-auto mb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] font-bold text-sm uppercase tracking-wider transition-all",
            activeTab === 'active' 
              ? "bg-background text-foreground shadow-sm border border-border/50" 
              : "text-muted-foreground/60 hover:text-foreground"
          )}
        >
          <Clock className="h-4 w-4 shrink-0" />
          Ativas
          {activeTasks.length > 0 && (
            <span className="ml-1.5 bg-primary/15 text-primary px-2 py-0.5 rounded-full text-xs font-black">
              {activeTasks.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] font-bold text-sm uppercase tracking-wider transition-all",
            activeTab === 'completed' 
              ? "bg-background text-green-500 shadow-sm border border-border/50" 
              : "text-muted-foreground/60 hover:text-foreground"
          )}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Concluídas
          {completedTasks.length > 0 && (
            <span className="ml-1.5 bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full text-xs font-black">
              {completedTasks.length}
            </span>
          )}
        </button>
      </div>

      {/* Conteúdo das abas */}
      <div className="space-y-4" role="list" aria-label="Lista de Tarefas">
        {activeTab === 'active' ? (
          /* Aba: Ativas */
          activeTasks.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-[3rem] opacity-50 flex flex-col items-center">
              <Sparkles className="h-10 w-10 text-primary mb-3" />
              <h3 className="text-lg font-bold mb-1">Nenhuma Tarefa Ativa!</h3>
              <p className="text-xs font-medium max-w-xs mx-auto">Parabéns! Todas as tarefas marcadas como ativas foram concluídas.</p>
            </div>
          ) : (
            activeTasks.map((task) => renderTaskCard(task))
          )
        ) : (
          /* Aba: Concluídas (Separadas por Data) */
          completedTasks.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-[3rem] opacity-50 flex flex-col items-center">
              <FolderCheck className="h-10 w-10 text-green-500 mb-3" />
              <h3 className="text-lg font-bold mb-1">Nenhuma Tarefa Concluída!</h3>
              <p className="text-xs font-medium max-w-xs mx-auto">Conclua alguma tarefa para visualizá-la no histórico.</p>
            </div>
          ) : (
            sortedGroupDates.map((dateGroup) => (
              <div key={dateGroup} className="space-y-3">
                {/* Divisor de data super polido */}
                <div className="pt-4 pb-1 first:pt-0">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-green-500/70 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-green-600 dark:text-green-400 bg-green-500/10 dark:bg-green-500/20 px-3 py-1 rounded-full shrink-0">
                      {formatGroupHeaderDate(dateGroup)}
                    </span>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-green-500/20 to-transparent" />
                  </div>
                </div>

                {completedGroups[dateGroup].map((task) => renderTaskCard(task))}
              </div>
            ))
          )
        )}
      </div>

      {/* Modal de CRUD da Tarefa */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-6 gap-6 border-none shadow-3xl overscroll-behavior-contain max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="bg-primary/5 w-12 h-12 rounded-2xl flex items-center justify-center text-primary">
                <CircleDashed className="h-6 w-6 animate-spin-slow" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-muted/60 px-3 py-1 rounded-full text-muted-foreground">
                Editor de Tarefa
              </span>
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black tracking-tighter text-wrap-balance">
                Gerenciar Tarefa
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground">
                Modifique os detalhes, prioridades, status ou exclua a tarefa.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Input de Nome da Tarefa */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/75 px-1">Nome da Tarefa</label>
              <Input
                value={editTarefa}
                onChange={(e) => setEditTarefa(e.target.value)}
                placeholder="Ex: Revisar relatórios fiscais..."
                className="h-12 rounded-xl border-2 font-bold focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>

            {/* Responsável */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/75 px-1">Responsável</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Amanda', 'Bárbara', 'Daisy'] as const).map((name) => {
                  const nameColors = {
                    Amanda: 'bg-purple-500/10 text-purple-500 border-purple-500/20 active:bg-purple-500 active:text-white',
                    'Bárbara': 'bg-pink-500/10 text-pink-500 border-pink-500/20 active:bg-pink-500 active:text-white',
                    Daisy: 'bg-amber-500/10 text-amber-500 border-amber-500/20 active:bg-amber-500 active:text-white',
                  };
                  
                  const activeNameColors = {
                    Amanda: 'bg-purple-500 text-white border-purple-500 shadow-sm',
                    'Bárbara': 'bg-pink-500 text-white border-pink-500 shadow-sm',
                    Daisy: 'bg-amber-500 text-white border-amber-500 shadow-sm',
                  };

                  const isSelected = editResponsavel === name;

                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setEditResponsavel(name)}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all active:scale-95 shrink-0",
                        isSelected ? activeNameColors[name] : nameColors[name]
                      )}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/75 px-1">Prioridade</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Urgente', 'Alta', 'Média', 'Baixa'] as const).map((prio) => {
                  const prioColors = {
                    Urgente: 'bg-red-500/10 text-red-500 border-red-500/20 active:bg-red-500 active:text-white',
                    Alta: 'bg-orange-500/10 text-orange-500 border-orange-500/20 active:bg-orange-500 active:text-white',
                    Média: 'bg-blue-500/10 text-blue-500 border-blue-500/20 active:bg-blue-500 active:text-white',
                    Baixa: 'bg-slate-500/10 text-slate-500 border-slate-500/20 active:bg-slate-500 active:text-white',
                  };
                  
                  const activePrioColors = {
                    Urgente: 'bg-red-500 text-white border-red-500 shadow-sm',
                    Alta: 'bg-orange-500 text-white border-orange-500 shadow-sm',
                    Média: 'bg-blue-500 text-white border-blue-500 shadow-sm',
                    Baixa: 'bg-slate-500 text-white border-slate-500 shadow-sm',
                  };

                  const isSelected = editPrioridade === prio;

                  return (
                    <button
                      key={prio}
                      type="button"
                      onClick={() => setEditPrioridade(prio)}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all active:scale-95 shrink-0",
                        isSelected ? activePrioColors[prio] : prioColors[prio]
                      )}
                    >
                      {prio}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Complexidade */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/75 px-1">Complexidade</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Alta', 'Média', 'Baixa'] as const).map((comp) => {
                  const compColors = {
                    Alta: 'bg-purple-500/10 text-purple-500 border-purple-500/20 active:bg-purple-500 active:text-white',
                    Média: 'bg-green-500/10 text-green-500 border-green-500/20 active:bg-green-500 active:text-white',
                    Baixa: 'bg-slate-500/10 text-slate-500 border-slate-500/20 active:bg-slate-500 active:text-white',
                  };
                  
                  const activeCompColors = {
                    Alta: 'bg-purple-500 text-white border-purple-500 shadow-sm',
                    Média: 'bg-green-500 text-white border-green-500 shadow-sm',
                    Baixa: 'bg-slate-500 text-white border-slate-500 shadow-sm',
                  };

                  const isSelected = editComplexidade === comp;

                  return (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => setEditComplexidade(comp)}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all active:scale-95 shrink-0",
                        isSelected ? activeCompColors[comp] : compColors[comp]
                      )}
                    >
                      {comp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/75 px-1">Status do Progresso</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'Pendente', icon: Clock, activeColor: 'bg-slate-500 text-white border-slate-500 shadow-sm', normalColor: 'bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 border-slate-500/20', label: 'Pendente' },
                  { id: 'Parcial', icon: Timer, activeColor: 'bg-orange-500 text-white border-orange-500 shadow-sm', normalColor: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20', label: 'Parcial' },
                  { id: 'Concluída', icon: CheckCircle2, activeColor: 'bg-green-500 text-white border-green-500 shadow-sm', normalColor: 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20', label: 'Concluída' },
                ].map((status) => {
                  const isSelected = tempStatus === status.id;
                  return (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => setTempStatus(status.id as TaskStatus)}
                      className={cn(
                        "flex flex-col items-center justify-center py-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all active:scale-95 shrink-0 gap-1",
                        isSelected ? status.activeColor : status.normalColor
                      )}
                    >
                      <status.icon className="h-4 w-4 shrink-0" />
                      {status.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comentário */}
            {(tempStatus === 'Parcial' || comment) && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 px-1">Comentários / Observações</label>
                <Textarea
                  placeholder="Explique o que foi feito ou o que falta…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="rounded-2xl border-none bg-muted/40 focus-visible:bg-background h-20 font-medium"
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col gap-2 pt-2 border-t">
            {confirmDelete ? (
              <div className="w-full bg-red-500/5 border border-red-500/20 p-4 rounded-2xl space-y-3 animate-in zoom-in-95">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-red-600">Excluir tarefa permanentemente?</h4>
                    <p className="text-xs text-muted-foreground font-medium">Esta ação não pode ser desfeita. Todos os dados desta tarefa serão removidos do Google Sheets.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    className="flex-1 h-10 rounded-xl text-xs font-bold uppercase tracking-wider"
                    onClick={handleDeleteTask}
                    disabled={isPending}
                  >
                    {isPending ? 'Excluindo…' : 'Sim, Excluir'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-10 rounded-xl text-xs font-bold uppercase tracking-wider"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <Button
                  className="w-full h-14 rounded-2xl text-base font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-transform active:scale-95"
                  onClick={handleUpdateTask}
                  disabled={isPending || !editTarefa.trim() || (tempStatus === 'Parcial' && !comment.trim())}
                >
                  {isPending ? 'Salvando…' : 'Salvar Alterações'}
                </Button>
                
                <div className="flex gap-2 w-full">
                  <Button
                    variant="ghost"
                    className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-wider text-red-500/80 hover:text-red-600 hover:bg-red-500/5"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2 shrink-0" />
                    Excluir
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-wider opacity-60"
                    onClick={() => setSelectedTask(null)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
