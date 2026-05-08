'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Task, TaskStatus } from '@/types/task';
import { getDailyReport, updateTaskStatus } from '@/actions/tasks';
import { Trophy, Clock, ClipboardList, Coffee, Sparkles, CheckCircle2, Timer, AlertCircle, MessageSquarePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface ReportData {
  completedCount: number;
  pendingCount: number;
  partialCount: number;
  tasks: Task[];
}

const REPORT_TIME = 17;

export function DailyReportModal() {
  const [open, setOpen] = React.useState(false);
  const [report, setReport] = React.useState<ReportData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date().getHours());
  const [isUpdating, startTransition] = React.useTransition();
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
  const [comment, setComment] = React.useState('');

  const fetchReport = React.useCallback(async () => {
    setLoading(true);
    const data = await getDailyReport();
    setReport(data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.getHours());
      if (now.getHours() === REPORT_TIME && now.getMinutes() === 30 && !open) {
        setOpen(true);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [open]);

  React.useEffect(() => {
    if (open) {
      fetchReport();
    }
  }, [open, fetchReport]);

  const handleStatusUpdate = (id: string, status: TaskStatus, taskComment?: string) => {
    startTransition(async () => {
      await updateTaskStatus(id, status, taskComment);
      setEditingTaskId(null);
      setComment('');
      fetchReport();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 h-14 md:h-16 px-6 md:px-8 rounded-full shadow-2xl shadow-primary/40 animate-bounce hover:animate-none group z-40 transition-transform active:scale-95"
          aria-label="Gerar Relatório Diário"
          onClick={fetchReport}
        >
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:rotate-12" />
            <span className="font-black text-sm md:text-base uppercase tracking-widest">Relatório Do Dia</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-lg rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl overscroll-behavior-contain flex flex-col max-h-[90vh]"
        aria-describedby="report-description"
      >
        <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden shrink-0">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" aria-hidden="true" />
           <DialogTitle className="text-3xl md:text-4xl font-black tracking-tighter text-wrap-balance">Resumo De Hoje</DialogTitle>
           <p id="report-description" className="text-primary-foreground/80 mt-2 font-medium text-pretty">Veja seu progresso e finalize o dia.</p>
        </div>
        
        <div className="p-6 md:p-8 space-y-8 bg-background overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4" aria-live="polite">
              <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Gerando Resumo…</p>
            </div>
          ) : report ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div className="bg-green-500/5 p-4 rounded-3xl border border-green-500/10 text-center">
                  <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Fitas</p>
                  <p className="text-3xl font-black text-green-600 tracking-tighter tabular-nums">{report.completedCount}</p>
                </div>
                <div className="bg-orange-500/5 p-4 rounded-3xl border border-orange-500/10 text-center">
                  <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">Pausas</p>
                  <p className="text-3xl font-black text-orange-600 tracking-tighter tabular-nums">{report.partialCount}</p>
                </div>
                <div className="bg-muted/40 p-4 rounded-3xl border border-primary/5 text-center">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Abertas</p>
                  <p className="text-3xl font-black text-muted-foreground tracking-tighter tabular-nums">{report.pendingCount}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2">
                  <span className="h-1 w-6 bg-primary/20 rounded-full" />
                  Revisão De Tarefas
                </h3>
                <div className="space-y-4">
                  {report.tasks.map((task) => (
                    <div key={task.id} className="bg-muted/30 p-5 rounded-3xl border border-transparent hover:border-primary/10 transition-all space-y-4">
                      <p className="font-bold text-sm md:text-base truncate">{task.tarefa}</p>
                      <div className="flex gap-2">
                        {[
                          { id: 'Pendente', icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted/50' },
                          { id: 'Parcial', icon: Timer, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                          { id: 'Concluída', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              if (s.id === 'Parcial') {
                                setEditingTaskId(task.id);
                                setComment(task.comentario || '');
                              } else {
                                handleStatusUpdate(task.id, s.id as TaskStatus);
                              }
                            }}
                            className={cn(
                              "flex-1 flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all",
                              task.status === s.id 
                                ? "bg-background border-primary/20 shadow-sm" 
                                : "bg-transparent border-transparent opacity-40 hover:opacity-100"
                            )}
                          >
                            <s.icon className={cn("h-4 w-4", task.status === s.id ? s.color : "text-muted-foreground")} />
                            <span className="text-[8px] font-black uppercase tracking-tighter">{s.id}</span>
                          </button>
                        ))}
                      </div>

                      {editingTaskId === task.id && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 pt-2">
                          <Textarea 
                            placeholder="Descreva o progresso parcial…"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="rounded-2xl border-none bg-background h-20 text-xs font-medium"
                          />
                          <Button 
                            size="sm"
                            className="w-full rounded-xl h-10 font-black text-[10px] uppercase tracking-widest"
                            onClick={() => handleStatusUpdate(task.id, 'Parcial', comment)}
                            disabled={isUpdating || !comment.trim()}
                          >
                            {isUpdating ? 'Salvando…' : 'Salvar Comentário'}
                          </Button>
                        </div>
                      )}
                      
                      {task.status === 'Parcial' && task.comentario && editingTaskId !== task.id && (
                        <div className="flex items-start gap-2 bg-background/50 p-3 rounded-xl border border-orange-500/10">
                           <MessageSquarePlus className="h-3 w-3 text-orange-500 mt-0.5 shrink-0" />
                           <p className="text-[10px] font-medium text-muted-foreground italic line-clamp-2">{task.comentario}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 rounded-3xl p-6 flex items-center gap-4 border border-primary/10">
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <Coffee className="h-6 w-6 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-black text-primary uppercase tracking-wider">Hora De Recarregar</p>
                  <p className="text-muted-foreground font-medium">Você concluiu sua jornada. Bom descanso!</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground font-medium">Nenhuma tarefa encontrada para hoje.</p>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 md:p-8 border-t bg-muted/10 shrink-0">
          <Button 
            type="button" 
            className="w-full h-14 rounded-2xl text-base font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-transform active:scale-95"
            onClick={() => setOpen(false)}
          >
            Fechar Relatório
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
