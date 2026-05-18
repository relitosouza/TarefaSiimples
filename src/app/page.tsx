import { AddTaskForm } from '@/components/AddTaskForm';
import { TaskList } from '@/components/TaskList';
import { getTasks } from '@/actions/tasks';
import { OpenReportButton } from '@/components/OpenReportButton';
import { GeneralReportModal } from '@/components/GeneralReportModal';
import { ModeToggle } from '@/components/mode-toggle';
import { 
  CheckCircle2, ListTodo, Activity, 
  Calendar, ShieldAlert, Zap, TrendingUp, Clock 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function Home() {
  const { tasks, history } = await getTasks();
  
  // Real-time calculations
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'Concluída').length;
  const pendingCount = tasks.filter(t => t.status === 'Pendente').length;
  const partialCount = tasks.filter(t => t.status === 'Parcial').length;
  const activeCount = pendingCount + partialCount;
  
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // High Priority / Urgent Tasks
  const urgentTasks = tasks.filter(t => t.status !== 'Concluída' && t.prioridade === 'Urgente');

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#080808] selection:bg-primary/10 transition-colors flex flex-col">
      
      {/* 1. Header Fixo & Transparente (Glassmorphism) */}
      <nav className="sticky top-0 z-30 w-full border-b border-primary/5 bg-background/80 backdrop-blur-md transition-all">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/5 p-2 rounded-xl border border-primary/10 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-sm font-black uppercase tracking-[0.25em] text-primary">TarefaSimples</span>
          </div>

          <div className="flex items-center gap-3">
            <OpenReportButton />
            <ModeToggle />
          </div>
        </div>
      </nav>

      {/* 2. Container do Dashboard */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
        
        {/* Banner Minimalista de Apresentação */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 md:p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-xl" />
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-balance">
              Organize sua rotina com <span className="text-primary italic">precisão.</span>
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">
              Gerencie suas pendências de forma minimalista. Dados integrados em tempo real com o Google Sheets.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 bg-primary/5 px-4 py-2.5 rounded-2xl border border-primary/10 w-fit">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>
        </header>

        {/* 3. Cards de Estatísticas Rápidas (Aumentados no comprimento/altura) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-5" aria-label="Estatísticas Rápidas">
          <div className="bg-card/50 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-primary/5 shadow-sm flex flex-col justify-between min-h-[160px] transition-all hover:border-primary/10 hover:shadow-md">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Total de Tarefas</p>
            <div className="flex items-end justify-between">
              <span className="text-4xl md:text-5xl font-black tracking-tight tabular-nums leading-none">{totalCount}</span>
              <div className="bg-muted/50 p-3 rounded-2xl text-muted-foreground">
                <ListTodo className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-primary/5 shadow-sm flex flex-col justify-between min-h-[160px] transition-all hover:border-primary/10 hover:shadow-md">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Pendentes / Ativas</p>
            <div className="flex items-end justify-between">
              <span className="text-4xl md:text-5xl font-black tracking-tight tabular-nums leading-none text-blue-500">{activeCount}</span>
              <div className="bg-blue-500/5 p-3 rounded-2xl text-blue-500 border border-blue-500/10">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-primary/5 shadow-sm flex flex-col justify-between min-h-[160px] transition-all hover:border-primary/10 hover:shadow-md">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Em Progresso (Parcial)</p>
            <div className="flex items-end justify-between">
              <span className="text-4xl md:text-5xl font-black tracking-tight tabular-nums leading-none text-orange-500">{partialCount}</span>
              <div className="bg-orange-500/5 p-3 rounded-2xl text-orange-500 border border-orange-500/10">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-primary/5 shadow-sm flex flex-col justify-between min-h-[160px] transition-all hover:border-primary/10 hover:shadow-md">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Taxa de Conclusão</p>
            <div className="flex items-end justify-between">
              <span className="text-4xl md:text-5xl font-black tracking-tight tabular-nums leading-none text-green-500">{completionRate}%</span>
              <div className="bg-green-500/5 p-3 rounded-2xl text-green-500 border border-green-500/10">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Layout Centralizado de Foco (Sem painel de produtividade) */}
        <div className="space-y-8 pt-4">
          
          {/* Alerta de Tarefas Urgentes (Exibido de forma elegante acima de tudo) */}
          {urgentTasks.length > 0 && (
            <div className="bg-red-500/5 dark:bg-red-500/10 p-6 rounded-[2.5rem] border border-red-500/20 space-y-4 animate-in fade-in duration-500">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> Atenção Necessária
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                Você tem {urgentTasks.length} {urgentTasks.length === 1 ? 'tarefa classificada' : 'tarefas classificadas'} como <strong>Urgente</strong> pendentes de conclusão.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {urgentTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="bg-card p-4 rounded-2xl border border-red-500/10 text-xs font-bold truncate flex items-center gap-2">
                    <span className="shrink-0 text-red-500">⚠️</span>
                    <span className="truncate">{task.tarefa}</span>
                  </div>
                ))}
              </div>
              {urgentTasks.length > 3 && (
                <p className="text-[10px] text-red-500/80 font-black uppercase tracking-wider pl-1">
                  + {urgentTasks.length - 3} itens urgentes pendentes no total
                </p>
              )}
            </div>
          )}

          {/* Lançador de Tarefas */}
          <section className="bg-card/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-primary/5 shadow-sm space-y-6" aria-labelledby="workspace-heading">
            <h2 id="workspace-heading" className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 px-1 flex items-center gap-2">
              <Zap className="h-4 w-4" /> Nova Tarefa
            </h2>
            <AddTaskForm history={history} />
          </section>

          {/* Listagem Principal */}
          <section className="space-y-4" aria-labelledby="tasks-heading">
            <div className="flex items-end justify-between px-2">
              <div>
                <h2 id="tasks-heading" className="text-2xl md:text-3xl font-black tracking-tight">Minhas Tarefas</h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5 font-medium">
                  {activeCount} {activeCount === 1 ? 'item ativo' : 'itens ativos'} hoje
                </p>
              </div>
            </div>
            <TaskList tasks={tasks} />
          </section>
        </div>

        {/* Componentes Flutuantes */}
        <GeneralReportModal tasks={tasks} />
      </main>

      {/* Rodapé Premium */}
      <footer className="py-12 border-t border-primary/5 text-center mt-12 bg-card/10 shrink-0">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20">
          TarefaSimples &bull; © 2026 &bull; Powered by AG Kit
        </p>
      </footer>
    </div>
  );
}
