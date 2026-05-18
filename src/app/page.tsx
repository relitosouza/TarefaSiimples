import { AddTaskForm } from '@/components/AddTaskForm';
import { TaskList } from '@/components/TaskList';
import { getTasks } from '@/actions/tasks';
import { DailyReportModal } from '@/components/DailyReportModal';
import { GeneralReportModal } from '@/components/GeneralReportModal';
import { ProductivityCharts } from '@/components/ProductivityCharts';
import { BarChart2, CheckCircle2 } from 'lucide-react';

export default async function Home() {
  const { tasks, history } = await getTasks();
  const pendingTasksCount = tasks.filter(t => t.status !== 'Concluída').length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0A0A0A] selection:bg-primary/10 transition-colors">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-16">
        
        {/* Cabeçalho de Boas-vindas */}
        <header className="flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Sistema TarefaSimples</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-balance leading-[0.9]">
            Organize sua rotina com <span className="text-primary italic">precisão.</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl font-medium">
            Gerencie tarefas complexas de forma minimalista. Sincronizado com Google Sheets.
          </p>
        </header>

        {/* Input Principal */}
        <section className="max-w-4xl mx-auto w-full">
          <AddTaskForm history={history} />
        </section>

        {/* Layout Grid: Tarefas + Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
          
          {/* Coluna da Esquerda: Lista de Tarefas */}
          <section className="lg:col-span-8 space-y-8" aria-labelledby="tasks-heading">
            <div className="flex items-center justify-between px-2 gap-4">
              <div>
                <h2 id="tasks-heading" className="text-2xl md:text-4xl font-black tracking-tight">Minhas Tarefas</h2>
                <p className="text-xs md:text-base text-muted-foreground mt-1 font-medium">
                  {pendingTasksCount} {pendingTasksCount === 1 ? 'item pendente' : 'itens pendentes'} hoje
                </p>
              </div>
              <GeneralReportModal tasks={tasks} />
            </div>
            <TaskList tasks={tasks} />
          </section>

          {/* Coluna da Direita: Produtividade */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3 px-2">
               <div className="bg-orange-500/10 p-2 rounded-xl">
                 <BarChart2 className="h-5 w-5 text-orange-500" />
               </div>
               <h2 className="text-xl md:text-2xl font-black tracking-tight">Produtividade</h2>
            </div>
            <div className="sticky top-8">
              <ProductivityCharts tasks={tasks} />
            </div>
          </aside>
        </div>

        {/* Componentes Flutuantes */}
        <DailyReportModal />
      </main>

      <footer className="py-12 border-t border-primary/5 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
          TarefaSimples &bull; © 2026
        </p>
      </footer>
    </div>
  );
}
