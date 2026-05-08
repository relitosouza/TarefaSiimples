'use client';

import * as React from 'react';
import { Plus, Search, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addTask } from '@/actions/tasks';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';

interface AddTaskFormProps {
  history: string[];
}

export function AddTaskForm({ history }: AddTaskFormProps) {
  const [value, setValue] = React.useState('');
  const [isPending, startTransition] = useTransition();
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const filteredHistory = React.useMemo(() => {
    if (!value.trim()) return [];
    const search = value.toLowerCase();
    return history.filter(item => 
      item.toLowerCase().includes(search) && 
      item.toLowerCase() !== search
    ).slice(0, 5);
  }, [value, history]);

  const handleAddTask = (taskName: string = value) => {
    if (!taskName.trim()) return;

    startTransition(async () => {
      const result = await addTask(taskName);
      if (result.success) {
        setValue('');
        setShowSuggestions(false);
      }
    });
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, { passive: true });
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex gap-2 items-center" role="search">
        <div className="relative flex-1 group">
          <Input
            id="task-input"
            name="task"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Qual A Próxima Tarefa… (ex: Revisar Relatório)"
            className="h-14 md:h-16 pl-14 pr-12 rounded-3xl border-none bg-muted/40 focus-visible:bg-background focus-visible:ring-primary/20 text-lg transition-all shadow-inner"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTask();
            }}
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 bg-primary/10 p-2 rounded-xl text-primary transition-transform group-focus-within:scale-110" aria-hidden="true">
            <Search className="h-5 w-5" />
          </div>
          {value && (
            <button 
              type="button"
              onClick={() => {
                setValue('');
                setShowSuggestions(false);
              }}
              aria-label="Limpar Texto"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button 
          type="submit"
          onClick={() => handleAddTask()}
          disabled={isPending || !value.trim()}
          aria-label={isPending ? "Salvando Tarefa…" : "Adicionar Tarefa"}
          className="h-14 md:h-16 w-14 md:w-16 rounded-3xl shadow-2xl shadow-primary/20 flex-shrink-0 p-0 transition-transform active:scale-95"
        >
          <span className="sr-only">Adicionar Tarefa</span>
          <div aria-live="polite" className="flex items-center justify-center">
            {isPending ? (
              <span className="text-xs font-bold animate-pulse">…</span>
            ) : (
              <Plus className="h-8 w-8" aria-hidden="true" />
            )}
          </div>
        </Button>
      </div>

      {showSuggestions && filteredHistory.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-3 bg-background/80 backdrop-blur-xl border border-primary/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 overscroll-behavior-contain"
          role="listbox"
          aria-label="Sugestões de tarefas"
        >
          <div className="p-3">
            <div className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary/60" aria-hidden="true">
              <Sparkles className="h-3 w-3" />
              Sugestões Rápidas
            </div>
            {filteredHistory.map((item) => (
              <button
                key={item}
                type="button"
                role="option"
                onClick={() => {
                  setValue(item);
                  handleAddTask(item);
                }}
                className="w-full text-left px-4 py-4 hover:bg-primary/5 rounded-[1.5rem] transition-all flex items-center gap-4 group focus-visible:bg-primary/5 outline-none"
              >
                <div className="h-10 w-10 flex items-center justify-center bg-muted rounded-2xl group-hover:bg-primary/10 transition-colors" aria-hidden="true">
                   <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="flex-1 font-medium text-foreground/80 group-hover:text-foreground transition-colors truncate">
                  {item}
                </span>
                <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                   ADICIONAR
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
