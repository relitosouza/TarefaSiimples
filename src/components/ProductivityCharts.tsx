'use client';

import { Task } from '@/types/task';
import { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';

interface ProductivityChartsProps {
  tasks: Task[];
}

const STATUS_COLORS = {
  'Concluída': 'oklch(0.627 0.194 149.214)', // Green
  'Parcial': 'oklch(0.769 0.188 70.08)',    // Orange
  'Pendente': 'oklch(0.556 0 0)',            // Gray
};

const PRIORITY_COLORS = {
  'Urgente': 'oklch(0.577 0.245 27.325)',    // Red
  'Alta': 'oklch(0.769 0.188 70.08)',       // Orange
  'Média': 'oklch(0.708 0 0)',               // Gray
  'Baixa': 'oklch(0.922 0 0)',               // Light Gray
};

export function ProductivityCharts({ tasks }: ProductivityChartsProps) {
  const statusData = useMemo(() => {
    const counts = tasks.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const priorityData = useMemo(() => {
    const counts = tasks.reduce((acc, t) => {
      const p = t.prioridade || 'Média';
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return ['Baixa', 'Média', 'Alta', 'Urgente'].map(p => ({
      name: p,
      quantidade: counts[p] || 0
    }));
  }, [tasks]);

  if (tasks.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Gráfico de Status */}
      <div className="bg-card/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-primary/5">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 mb-6 px-2">Distribuição de Status</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Prioridade */}
      <div className="bg-card/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-primary/5">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500/60 mb-6 px-2">Prioridade das Tarefas</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 10, fontWeight: 'bold' }} 
                width={70}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="quantidade" radius={[0, 10, 10, 0]}>
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
