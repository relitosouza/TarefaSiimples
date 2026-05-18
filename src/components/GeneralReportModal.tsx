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
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/task';
import { 
  ClipboardList, CheckCircle2, Clock, Timer, AlertTriangle, 
  Copy, Printer, Search, Calendar, CheckCircle, TrendingUp, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeneralReportModalProps {
  tasks: Task[];
}

export function GeneralReportModal({ tasks }: GeneralReportModalProps) {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'resumo' | 'pendentes' | 'concluidas'>('resumo');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  // Computations
  const totalCount = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Concluída');
  const pendingTasks = tasks.filter(t => t.status === 'Pendente');
  const partialTasks = tasks.filter(t => t.status === 'Parcial');
  
  const completedCount = completedTasks.length;
  const pendingCount = pendingTasks.length;
  const partialCount = partialTasks.length;
  
  const activeTasksCount = pendingCount + partialCount;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Average time to complete (in days)
  const averageCompletionTime = React.useMemo(() => {
    const times = completedTasks
      .map(t => {
        if (!t.data_conclusao || !t.data_criacao) return null;
        const start = new Date(t.data_criacao).getTime();
        const end = new Date(t.data_conclusao).getTime();
        return (end - start) / (1000 * 60 * 60 * 24); // in days
      })
      .filter((time): time is number => time !== null && time >= 0);

    if (times.length === 0) return 0;
    const sum = times.reduce((a, b) => a + b, 0);
    return Math.round((sum / times.length) * 10) / 10;
  }, [completedTasks]);

  // Breakdown by priority
  const priorityStats = React.useMemo(() => {
    const stats = { Urgente: 0, Alta: 0, Média: 0, Baixa: 0 };
    tasks.forEach(t => {
      const p = t.prioridade || 'Média';
      if (p in stats) stats[p as keyof typeof stats]++;
    });
    return stats;
  }, [tasks]);

  // Date formatter
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

  // Time elapsed helper
  const getTimeElapsed = (dateString: string) => {
    try {
      const created = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Criada hoje';
      if (diffDays === 1) return 'Criada há 1 dia';
      return `Criada há ${diffDays} dias`;
    } catch {
      return '';
    }
  };

  // Completion duration helper
  const getCompletionDuration = (startString: string, endString: string) => {
    try {
      const start = new Date(startString);
      const end = new Date(endString);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Concluída no mesmo dia';
      if (diffDays === 1) return 'Concluída em 1 dia';
      return `Concluída em ${diffDays} dias`;
    } catch {
      return '';
    }
  };

  // Copy to Clipboard
  const handleCopyReport = () => {
    const today = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());

    let reportText = `📋 RELATÓRIO GERAL DE TAREFAS - TAREFASIMPLES\nGerado em: ${today}\n\n`;
    reportText += `📊 RESUMO GERAL:\n`;
    reportText += `• Total de Tarefas: ${totalCount}\n`;
    reportText += `• Concluídas: ${completedCount} (${completionRate}% de conclusão)\n`;
    reportText += `• Em Progresso (Parcial): ${partialCount}\n`;
    reportText += `• Pendentes: ${pendingCount}\n`;
    if (completedCount > 0) {
      reportText += `• Tempo Médio de Conclusão: ${averageCompletionTime} dia(s)\n`;
    }
    reportText += `\n`;

    const pendingAndPartial = tasks.filter(t => t.status !== 'Concluída');
    if (pendingAndPartial.length > 0) {
      reportText += `⚠️ TAREFAS ATIVAS / PENDÊNCIAS (${pendingAndPartial.length}):\n`;
      pendingAndPartial.forEach((t, i) => {
        const priority = t.prioridade ? `[${t.prioridade}]` : '';
        const complexity = t.complexidade ? `[Complexidade: ${t.complexidade}]` : '';
        const elapsed = t.data_criacao ? ` (${getTimeElapsed(t.data_criacao)})` : '';
        const status = t.status === 'Parcial' ? ' [Em Progresso]' : '';
        reportText += `${i + 1}. ${status}${priority} ${t.tarefa} - ${complexity}${elapsed}\n`;
        if (t.comentario) {
          reportText += `   ↳ Comentário: "${t.comentario}"\n`;
        }
      });
      reportText += `\n`;
    }

    if (completedTasks.length > 0) {
      reportText += `✅ TAREFAS CONCLUÍDAS (${completedTasks.length}):\n`;
      completedTasks.forEach((t, i) => {
        const duration = t.data_criacao && t.data_conclusao ? ` (${getCompletionDuration(t.data_criacao, t.data_conclusao)})` : '';
        reportText += `${i + 1}. ${t.tarefa} - Concluída em ${t.data_conclusao ? formatDate(t.data_conclusao) : formatDate(t.data)}${duration}\n`;
      });
    }

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print Report
  const handlePrint = () => {
    const printContent = document.getElementById('printable-report-area');
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const originalBg = document.body.style.background;
    
    // Add print styles
    document.body.style.background = 'white';
    document.body.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; color: black; max-width: 800px; margin: 0 auto;">
        ${printContent.innerHTML}
      </div>
    `;
    
    window.print();
    
    // Restore original content
    document.body.style.background = originalBg;
    document.body.innerHTML = originalContent;
    window.location.reload(); // Quick reload to restore React state and listeners
  };

  // Filter tasks based on search
  const filteredPending = React.useMemo(() => {
    return tasks.filter(t => 
      t.status !== 'Concluída' && 
      t.tarefa.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  const filteredCompleted = React.useMemo(() => {
    return tasks.filter(t => 
      t.status === 'Concluída' && 
      t.tarefa.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button 
          variant="outline"
          className="rounded-2xl border-primary/20 hover:border-primary px-4 py-2 flex items-center gap-2 transition-all shrink-0 font-bold text-xs md:text-sm uppercase tracking-wider"
          aria-label="Abrir Relatório Geral"
        />}>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            <span>Relatório Geral</span>
          </div>
      </DialogTrigger>

      <DialogContent 
        className="sm:max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl overscroll-behavior-contain flex flex-col h-[90vh] max-h-[850px]"
        aria-describedby="general-report-description"
      >
        {/* Header com gradiente elegante (Ultra-Premium) */}
        <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] p-6 md:p-8 text-white relative shrink-0">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" aria-hidden="true" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <DialogTitle className="text-2xl md:text-4xl font-black tracking-tighter">Relatório Geral</DialogTitle>
              <p id="general-report-description" className="text-slate-400 mt-1 font-medium text-xs md:text-sm">
                Uma visão geral e detalhada de todas as pendências e tarefas concluídas.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleCopyReport}
                variant="ghost" 
                className="h-10 px-4 rounded-xl border border-white/10 hover:bg-white/10 hover:text-white font-bold text-xs uppercase tracking-wider gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
              <Button 
                onClick={handlePrint}
                variant="ghost" 
                className="h-10 px-4 rounded-xl border border-white/10 hover:bg-white/10 hover:text-white font-bold text-xs uppercase tracking-wider gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                Imprimir
              </Button>
            </div>
          </div>

          {/* Abas */}
          <div className="flex gap-2 mt-6 border-b border-white/10 pb-0 shrink-0">
            {[
              { id: 'resumo', label: 'Resumo Geral', count: totalCount },
              { id: 'pendentes', label: 'Ativas/Pendentes', count: activeTasksCount },
              { id: 'concluidas', label: 'Concluídas', count: completedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-2.5 font-black text-xs md:text-sm uppercase tracking-wider border-b-2 transition-all relative",
                  activeTab === tab.id 
                    ? "border-primary text-white font-black" 
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                {tab.label}
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-black tracking-normal">
                  {tab.count}
                </span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-sky-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F8F9FA] dark:bg-[#0E0E0E]">
          {/* Printable Container */}
          <div id="printable-report-area">
            
            {/* 1. ABA RESUMO */}
            {activeTab === 'resumo' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Grid de Cards de Estatísticas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-card p-5 rounded-[2rem] border border-primary/5 shadow-sm space-y-2 relative overflow-hidden">
                    <div className="h-2 w-2 rounded-full bg-slate-400 absolute top-4 right-4" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Total de Tarefas</p>
                    <p className="text-4xl font-black tracking-tighter text-foreground">{totalCount}</p>
                  </div>
                  
                  <div className="bg-card p-5 rounded-[2rem] border border-primary/5 shadow-sm space-y-2 relative overflow-hidden">
                    <div className="h-2 w-2 rounded-full bg-green-500 absolute top-4 right-4" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-semibold">Concluídas</p>
                    <p className="text-4xl font-black tracking-tighter text-green-500">{completedCount}</p>
                  </div>

                  <div className="bg-card p-5 rounded-[2rem] border border-primary/5 shadow-sm space-y-2 relative overflow-hidden">
                    <div className="h-2 w-2 rounded-full bg-orange-500 absolute top-4 right-4" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Em Progresso (Parcial)</p>
                    <p className="text-4xl font-black tracking-tighter text-orange-500">{partialCount}</p>
                  </div>

                  <div className="bg-card p-5 rounded-[2rem] border border-primary/5 shadow-sm space-y-2 relative overflow-hidden">
                    <div className="h-2 w-2 rounded-full bg-blue-500 absolute top-4 right-4" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Pendentes</p>
                    <p className="text-4xl font-black tracking-tighter text-blue-500">{pendingCount}</p>
                  </div>
                </div>

                {/* Grid de Detalhes de Progresso e Métricas */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Taxa de Conclusão */}
                  <div className="lg:col-span-7 bg-card p-6 rounded-[2.5rem] border border-primary/5 shadow-sm flex flex-col justify-between gap-6">
                    <div className="space-y-1">
                      <h4 className="font-black text-sm uppercase tracking-wider text-primary/60 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4" />
                        Taxa de Conclusão
                      </h4>
                      <p className="text-xs text-muted-foreground">Porcentagem das suas metas que já foram alcançadas.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-end justify-between">
                        <span className="text-4xl font-black tracking-tighter">{completionRate}%</span>
                        <span className="text-xs font-bold text-muted-foreground">{completedCount} de {totalCount} concluídas</span>
                      </div>
                      <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tempo Médio de Conclusão */}
                  <div className="lg:col-span-5 bg-card p-6 rounded-[2.5rem] border border-primary/5 shadow-sm flex flex-col justify-between gap-6">
                    <div className="space-y-1">
                      <h4 className="font-black text-sm uppercase tracking-wider text-primary/60 flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        Velocidade de Entrega
                      </h4>
                      <p className="text-xs text-muted-foreground font-medium">Tempo médio para concluir as tarefas.</p>
                    </div>

                    <div className="space-y-2">
                      {completedCount > 0 ? (
                        <>
                          <p className="text-4xl font-black tracking-tighter">{averageCompletionTime} <span className="text-lg font-bold text-muted-foreground">dia(s)</span></p>
                          <p className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Foco excelente em conclusão
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-semibold text-muted-foreground italic py-2">Dados insuficientes para calcular.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Prioridades e Recomendações */}
                <div className="bg-card p-6 rounded-[2.5rem] border border-primary/5 shadow-sm space-y-6">
                  <h4 className="font-black text-sm uppercase tracking-wider text-primary/60 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Distribuição por Prioridade
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { id: 'Urgente', color: 'bg-red-500', count: priorityStats.Urgente, text: 'text-red-500' },
                      { id: 'Alta', color: 'bg-orange-500', count: priorityStats.Alta, text: 'text-orange-500' },
                      { id: 'Média', color: 'bg-slate-400', count: priorityStats.Média, text: 'text-slate-400' },
                      { id: 'Baixa', color: 'bg-slate-300', count: priorityStats.Baixa, text: 'text-slate-300' },
                    ].map((p) => {
                      const percentage = totalCount > 0 ? Math.round((p.count / totalCount) * 100) : 0;
                      return (
                        <div key={p.id} className="bg-muted/30 p-4 rounded-2xl border border-transparent space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-xs uppercase tracking-wider">{p.id}</span>
                            <span className={cn("text-xs font-black", p.text)}>{p.count}</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", p.color)} style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resumo visual do dia */}
                <div className="bg-[#1E293B] text-slate-100 p-6 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h4 className="font-black text-sm uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-sky-400" />
                      Status Atual
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md font-medium">
                      Você possui <span className="text-white font-bold">{activeTasksCount} tarefas ativas</span> precisando de atenção. {completedCount > 0 ? `Excelente trabalho na conclusão das outras ${completedCount}!` : 'Dê o primeiro passo e conclua uma tarefa hoje!'}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setActiveTab('pendentes')}
                    className="bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-wider h-11 px-5 w-fit"
                  >
                    Ver Pendências
                  </Button>
                </div>
              </div>
            )}

            {/* 2. ABA ATIVAS/PENDENTES */}
            {activeTab === 'pendentes' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/40" />
                  <input
                    type="text"
                    placeholder="Pesquisar nas tarefas ativas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-2xl border border-primary/10 bg-card text-sm font-medium focus:outline-none focus:border-primary/30"
                  />
                </div>

                {/* Pending Tasks List */}
                <div className="space-y-4">
                  {filteredPending.length === 0 ? (
                    <div className="text-center py-16 bg-card border rounded-[2.5rem] opacity-50 flex flex-col items-center">
                      <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
                      <h4 className="font-bold text-lg mb-1">Nenhuma pendência encontrada!</h4>
                      <p className="text-xs max-w-xs mx-auto">Parabéns! Todas as tarefas pesquisadas foram concluídas ou você não tem itens pendentes.</p>
                    </div>
                  ) : (
                    filteredPending.map((task) => (
                      <div 
                        key={task.id} 
                        className={cn(
                          "bg-card p-5 rounded-[2rem] border border-primary/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary/20",
                          task.status === 'Parcial' && "border-l-4 border-l-orange-500"
                        )}
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-lg text-foreground tracking-tight leading-tight truncate">{task.tarefa}</p>
                            {task.status === 'Parcial' && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-500 border border-orange-500/10">
                                Em Progresso
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 text-[10px] md:text-xs font-black text-muted-foreground/50 uppercase tracking-[0.15em] flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {task.data_criacao ? formatDate(task.data_criacao) : formatDate(task.data)}
                            </span>
                            <span>•</span>
                            <span className="text-primary/60">{getTimeElapsed(task.data_criacao || task.data)}</span>
                            
                            {task.prioridade && (
                              <>
                                <span>•</span>
                                <span className={cn(
                                  task.prioridade === 'Urgente' && "text-red-500",
                                  task.prioridade === 'Alta' && "text-orange-500",
                                  task.prioridade === 'Média' && "text-slate-500",
                                  task.prioridade === 'Baixa' && "text-slate-400"
                                )}>
                                  Prioridade: {task.prioridade}
                                </span>
                              </>
                            )}

                            {task.complexidade && (
                              <>
                                <span>•</span>
                                <span className="text-slate-500">Complexidade: {task.complexidade}</span>
                              </>
                            )}
                          </div>

                          {task.comentario && (
                            <div className="bg-muted/40 p-3 rounded-xl border border-primary/5 text-xs text-muted-foreground font-medium italic mt-2">
                              Comentário: "{task.comentario}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. ABA CONCLUÍDAS */}
            {activeTab === 'concluidas' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/40" />
                  <input
                    type="text"
                    placeholder="Pesquisar nas concluídas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-2xl border border-primary/10 bg-card text-sm font-medium focus:outline-none focus:border-primary/30"
                  />
                </div>

                {/* Completed Tasks List */}
                <div className="space-y-4">
                  {filteredCompleted.length === 0 ? (
                    <div className="text-center py-16 bg-card border rounded-[2.5rem] opacity-50 flex flex-col items-center">
                      <Clock className="h-10 w-10 text-muted-foreground mb-3" />
                      <h4 className="font-bold text-lg mb-1">Nenhuma tarefa concluída!</h4>
                      <p className="text-xs max-w-xs mx-auto">Nenhuma tarefa marcada como concluída foi encontrada no seu histórico.</p>
                    </div>
                  ) : (
                    filteredCompleted.map((task) => (
                      <div 
                        key={task.id} 
                        className="bg-card p-5 rounded-[2rem] border border-primary/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary/20 opacity-90"
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          <p className="font-bold text-lg text-foreground line-through opacity-60 truncate">{task.tarefa}</p>
                          
                          <div className="flex items-center gap-3 text-[10px] md:text-xs font-black text-muted-foreground/50 uppercase tracking-[0.15em] flex-wrap">
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Concluída em {task.data_conclusao ? formatDate(task.data_conclusao) : formatDate(task.data)}
                            </span>
                            
                            {task.data_criacao && task.data_conclusao && (
                              <>
                                <span>•</span>
                                <span className="text-sky-600 font-semibold">{getCompletionDuration(task.data_criacao, task.data_conclusao)}</span>
                              </>
                            )}

                            {task.prioridade && (
                              <>
                                <span>•</span>
                                <span className="opacity-60">Prioridade: {task.prioridade}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
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
