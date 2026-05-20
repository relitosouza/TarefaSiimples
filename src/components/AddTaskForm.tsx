'use client';

import { addTask } from '@/actions/tasks';
import { useState, useTransition, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Zap, ShieldAlert, User, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddTaskFormProps {
  history: string[];
}

export function AddTaskForm({ history }: AddTaskFormProps) {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [complexity, setComplexity] = useState<'Baixa' | 'Média' | 'Alta'>('Média');
  const [priority, setPriority] = useState<'Baixa' | 'Média' | 'Alta' | 'Urgente'>('Média');
  const [responsavel, setResponsavel] = useState<'Amanda' | 'Bárbara' | 'Daisy'>('Amanda');
  const [mounted, setMounted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Estilos de cores para as prioridades combinando com os badges
  const priorityStyles: Record<string, { active: string; inactive: string }> = {
    'Urgente': {
      active: 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20 dark:bg-red-600 dark:border-red-600 dark:shadow-red-600/25',
      inactive: 'bg-card border-transparent text-muted-foreground hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-500'
    },
    'Alta': {
      active: 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20 dark:bg-orange-600 dark:border-orange-600 dark:shadow-orange-600/25',
      inactive: 'bg-card border-transparent text-muted-foreground hover:border-orange-500/30 hover:bg-orange-500/5 hover:text-orange-500'
    },
    'Média': {
      active: 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20 dark:bg-blue-600 dark:border-blue-600 dark:shadow-blue-600/25',
      inactive: 'bg-card border-transparent text-muted-foreground hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-blue-500'
    },
    'Baixa': {
      active: 'bg-slate-500 text-white border-slate-500 shadow-lg shadow-slate-500/20 dark:bg-slate-600 dark:border-slate-600 dark:shadow-slate-600/25',
      inactive: 'bg-card border-transparent text-muted-foreground hover:border-slate-500/30 hover:bg-slate-500/5 hover:text-slate-500'
    }
  };

  // Cores customizadas de marca para cada Responsável
  const responsavelStyles: Record<string, { active: string; inactive: string }> = {
    'Amanda': {
      active: 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20 dark:bg-purple-600 dark:border-purple-600 dark:shadow-purple-600/25',
      inactive: 'bg-card border-transparent text-muted-foreground hover:border-purple-500/30 hover:bg-purple-500/5 hover:text-purple-500'
    },
    'Bárbara': {
      active: 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/20 dark:bg-pink-600 dark:border-pink-600 dark:shadow-pink-600/25',
      inactive: 'bg-card border-transparent text-muted-foreground hover:border-pink-500/30 hover:bg-pink-500/5 hover:text-pink-500'
    },
    'Daisy': {
      active: 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20 dark:bg-amber-600 dark:border-amber-600 dark:shadow-amber-600/25',
      inactive: 'bg-card border-transparent text-muted-foreground hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-500'
    }
  };

  useEffect(() => {
    setMounted(true);
    setVoiceSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }, []);

  const startVoiceInput = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setShowSuggestions(true);
    };

    recognition.start();
  };

  const suggestions = history
    .filter(item => item.toLowerCase().includes(query.toLowerCase()) && query.length > 0)
    .slice(0, 5);

  const handleSubmit = (taskName: string) => {
    if (!taskName.trim()) return;
    
    startTransition(async () => {
      await addTask(taskName, complexity, priority, responsavel);
      setQuery('');
      setShowSuggestions(false);
    });
  };

  if (!mounted) return null;

  return (
    <div className="relative w-full space-y-6">
      {/* Input de Tarefa */}
      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
          <Plus className="h-6 w-6" />
        </div>
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="O que vamos realizar hoje?"
          className="h-16 md:h-20 pl-16 pr-32 md:pr-52 rounded-[2rem] border-none bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/5 text-lg md:text-xl font-bold placeholder:text-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {voiceSupported && (
            <button
              type="button"
              onClick={startVoiceInput}
              title={isListening ? 'Parar gravação' : 'Falar tarefa'}
              className={cn(
                "hidden md:flex h-12 w-12 rounded-full items-center justify-center transition-all border-2",
                isListening
                  ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30 animate-pulse"
                  : "bg-card border-transparent text-muted-foreground hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
              )}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          )}
           <Button
             onClick={() => handleSubmit(query)}
             disabled={isPending || !query.trim()}
             className="h-10 md:h-14 px-6 md:px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
           >
             {isPending ? '...' : 'Adicionar'}
           </Button>
        </div>
      </div>

      {/* Botão de microfone — apenas no celular */}
      {voiceSupported && (
        <button
          type="button"
          onClick={startVoiceInput}
          className={cn(
            "flex md:hidden w-full h-14 rounded-2xl items-center justify-center gap-3 font-bold text-sm uppercase tracking-widest transition-all border-2",
            isListening
              ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30 animate-pulse"
              : "bg-card border-transparent text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          )}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          <span>{isListening ? 'Parar gravação' : 'Falar tarefa'}</span>
        </button>
      )}

      {/* Sugestões */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-[5rem] md:top-[6rem] left-0 right-0 z-50 bg-card/90 backdrop-blur-2xl border rounded-[2rem] shadow-3xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="p-2">
              {suggestions.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(item);
                    handleSubmit(item);
                  }}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-primary/5 text-left transition-colors group"
                >
                  <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  <span className="font-bold text-base">{item}</span>
                </button>
              ))}
           </div>
        </div>
      )}

      {/* Seletores de Atributos em Grid Simétrico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
         {/* Responsável (Amanda, Bárbara, Daisy) */}
         <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 px-1 flex items-center gap-2">
               <User className="h-3 w-3" />
               Responsável
            </label>
            <div className="flex gap-2">
               {(['Amanda', 'Bárbara', 'Daisy'] as const).map((name) => (
                 <button
                   key={name}
                   type="button"
                   onClick={() => setResponsavel(name)}
                   className={cn(
                     "flex-1 h-12 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all border-2 active:scale-95",
                     responsavel === name 
                       ? responsavelStyles[name].active 
                       : responsavelStyles[name].inactive
                   )}
                 >
                   {name}
                 </button>
               ))}
            </div>
         </div>

         {/* Prioridade */}
         <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 px-1 flex items-center gap-2">
               <ShieldAlert className="h-3 w-3 animate-pulse" />
               Prioridade
            </label>
            <div className="flex gap-2">
               {['Baixa', 'Média', 'Alta', 'Urgente'].map((p) => (
                 <button
                   key={p}
                   onClick={() => setPriority(p as any)}
                   className={cn(
                     "flex-1 h-12 rounded-2xl font-bold text-[9px] uppercase tracking-wider transition-all border-2 active:scale-95",
                     priority === p 
                       ? priorityStyles[p].active 
                       : priorityStyles[p].inactive
                   )}
                 >
                   {p}
                 </button>
               ))}
            </div>
         </div>

         {/* Complexidade */}
         <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 px-1 flex items-center gap-2">
               <Zap className="h-3 w-3" />
               Complexidade
            </label>
            <div className="flex gap-2">
               {['Baixa', 'Média', 'Alta'].map((c) => (
                 <button
                   key={c}
                   onClick={() => setComplexity(c as any)}
                   className={cn(
                     "flex-1 h-12 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all border-2 active:scale-95",
                     complexity === c 
                       ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                       : "bg-card border-transparent text-muted-foreground hover:border-primary/20 hover:bg-background"
                   )}
                 >
                   {c}
                 </button>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
