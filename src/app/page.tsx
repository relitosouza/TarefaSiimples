import { getTasks } from '@/actions/tasks';
import { TaskList } from '@/components/TaskList';
import { AddTaskForm } from '@/components/AddTaskForm';
import { DailyReportModal } from '@/components/DailyReportModal';
import { ModeToggle } from '@/components/mode-toggle';

export default async function Home() {
  const { tasks, history } = await getTasks();

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 flex flex-col antialiased">
      <main className="flex-1 w-full max-w-lg mx-auto px-6 py-12 md:py-24">
        <header className="flex justify-between items-center mb-12 md:mb-20">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-wrap-balance">
              Tarefa<span className="text-primary italic" translate="no">Simples</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-xl font-medium tracking-tight opacity-70 text-wrap-balance">
              Sua rotina, organizada e leve.
            </p>
          </div>
          <ModeToggle />
        </header>

        <section className="mb-16 md:mb-24 relative z-50" aria-labelledby="add-task-heading">
           <h2 id="add-task-heading" className="sr-only">Adicionar Nova Tarefa</h2>
           <AddTaskForm history={history} />
        </section>

        <section className="space-y-8 pb-32" aria-labelledby="tasks-heading">
          <div className="flex items-end justify-between px-2">
            <div>
              <h2 id="tasks-heading" className="text-2xl md:text-4xl font-black tracking-tight text-wrap-balance">Afazeres</h2>
              <p className="text-xs md:text-base text-muted-foreground mt-1 font-medium">
                {tasks.filter(t => t.status !== 'Concluída').length} pendências para agora
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-primary/60 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10 select-none" aria-label="Status de sincronização">
               <span className="h-2 w-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
               Sheets Live
            </div>
          </div>
          
          <TaskList tasks={tasks} />
        </section>

        <DailyReportModal />
      </main>

      <footer className="py-12 border-t bg-muted/10 backdrop-blur-sm mt-auto">
        <div className="max-w-lg mx-auto px-6 flex flex-col items-center gap-4">
          <div className="h-1.5 w-12 bg-primary/20 rounded-full" aria-hidden="true" />
          <p className="text-[10px] md:text-xs text-muted-foreground font-black uppercase tracking-[0.3em] opacity-40">
            TarefaSimples &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
