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

  // 1. Ouvinte de evento customizado para disparar a abertura a partir de outros botões (ex: cabeçalho)
  React.useEffect(() => {
    const handleOpenEvent = () => {
      setOpen(true);
    };
    window.addEventListener('open-general-report', handleOpenEvent);
    return () => {
      window.removeEventListener('open-general-report', handleOpenEvent);
    };
  }, []);

  // 2. Timer de abertura automática às 17h30 (Relatório de Fim de Dia)
  const REPORT_TIME = 17;
  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getHours() === REPORT_TIME && now.getMinutes() === 30 && !open) {
        setOpen(true);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [open]);

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

    let reportText = `============================================================\n`;
    reportText += `       ✓ TAREFASIMPLES - GESTÃO & PRODUTIVIDADE\n`;
    reportText += `============================================================\n`;
    reportText += `            RELATÓRIO CONSOLIDADO DE ATIVIDADES\n`;
    reportText += `------------------------------------------------------------\n`;
    reportText += `Gerado em: ${today}\n`;
    reportText += `------------------------------------------------------------\n\n`;
    
    reportText += `📊 MÉTRICAS DE DESEMPENHO:\n`;
    reportText += `  • Total de Tarefas: ${totalCount}\n`;
    reportText += `  • Concluídas: ${completedCount} (${completionRate}% de taxa de conclusão)\n`;
    reportText += `  • Em Progresso (Parciais): ${partialCount}\n`;
    reportText += `  • Pendentes: ${pendingCount}\n`;
    if (completedCount > 0) {
      reportText += `  • Tempo Médio de Conclusão: ${averageCompletionTime} dia(s) por tarefa\n`;
    }
    reportText += `\n`;

    reportText += `🚨 STATUS DE PRIORIDADES ATIVAS:\n`;
    reportText += `  • Urgente: ${priorityStats.Urgente} | • Alta: ${priorityStats.Alta} | • Média: ${priorityStats.Média} | • Baixa: ${priorityStats.Baixa}\n\n`;

    const pendingAndPartial = tasks.filter(t => t.status !== 'Concluída');
    if (pendingAndPartial.length > 0) {
      reportText += `============================================================\n`;
      reportText += `⚠️ TAREFAS ATIVAS & EM PROGRESSO (${pendingAndPartial.length})\n`;
      reportText += `============================================================\n`;
      pendingAndPartial.forEach((t, i) => {
        const priority = t.prioridade ? `[${t.prioridade.toUpperCase()}]` : '[MÉDIA]';
        const complexity = t.complexidade ? `Complexidade: ${t.complexidade}` : 'Complexidade: Média';
        const elapsed = t.data_criacao ? `Criada: ${getTimeElapsed(t.data_criacao)}` : '';
        const status = t.status === 'Parcial' ? '[EM PROGRESSO] ' : '[PENDENTE] ';
        const assignee = t.responsavel ? ` | • Responsável: ${t.responsavel}` : '';
        
        reportText += `[${i + 1}] ${status}${priority} ${t.tarefa}\n`;
        reportText += `    • ${complexity} | • ${elapsed}${assignee}\n`;
        if (t.comentario) {
          reportText += `    ↳ Nota Interna: "${t.comentario}"\n`;
        }
        reportText += `------------------------------------------------------------\n`;
      });
      reportText += `\n`;
    }

    if (completedTasks.length > 0) {
      reportText += `============================================================\n`;
      reportText += `✅ TAREFAS CONCLUÍDAS RECENTEMENTE (${completedTasks.length})\n`;
      reportText += `============================================================\n`;
      completedTasks.forEach((t, i) => {
        const duration = t.data_criacao && t.data_conclusao ? `Duração: ${getCompletionDuration(t.data_criacao, t.data_conclusao)}` : 'Duração: Mesmo dia';
        const dateStr = t.data_conclusao ? formatDate(t.data_conclusao) : formatDate(t.data);
        const assignee = t.responsavel ? ` | • Responsável: ${t.responsavel}` : '';
        reportText += `[${i + 1}] ${t.tarefa}\n`;
        reportText += `    • Concluída em: ${dateStr} | • ${duration}${assignee}\n`;
        reportText += `------------------------------------------------------------\n`;
      });
      reportText += `\n`;
    }

    reportText += `============================================================\n`;
    reportText += `             TarefaSimples - Foco & Organização\n`;
    reportText += `============================================================`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print Report
  const handlePrint = () => {
    const today = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());

    const pendingAndPartial = tasks.filter(t => t.status !== 'Concluída');
    let pendingAndPartialListHTML = '';
    if (pendingAndPartial.length === 0) {
      pendingAndPartialListHTML = '<p style="font-size: 13px; color: #64748B; font-style: italic; margin-top: 10px;">Nenhuma tarefa ativa no momento.</p>';
    } else {
      pendingAndPartialListHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background: #F8FAFC; border-bottom: 2px solid #E2E8F0; text-align: left;">
              <th style="padding: 10px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; width: 40px;">ID</th>
              <th style="padding: 10px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">Tarefa / Descrição</th>
              <th style="padding: 10px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; text-align: center; width: 100px;">Status</th>
              <th style="padding: 10px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; text-align: center; width: 100px;">Prioridade</th>
              <th style="padding: 10px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; text-align: center; width: 100px;">Complexidade</th>
              <th style="padding: 10px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; text-align: center; width: 110px;">Responsável</th>
              <th style="padding: 10px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; text-align: right; width: 120px;">Criada em</th>
            </tr>
          </thead>
          <tbody>
            ${pendingAndPartial.map((t, idx) => {
              const priorityColors: Record<string, string> = {
                'Urgente': 'background: #FEE2E2; color: #991B1B;',
                'Alta': 'background: #FFEDD5; color: #9A3412;',
                'Média': 'background: #DBEAFE; color: #1E40AF;',
                'Baixa': 'background: #F1F5F9; color: #334155;'
              };
              const prioStyle = priorityColors[t.prioridade || 'Média'] || priorityColors['Média'];
              
              const compColors: Record<string, string> = {
                'Alta': 'background: #FAF5FF; color: #6B21A8; border: 1px solid #E9D5FF;',
                'Média': 'background: #F0FDF4; color: #166534; border: 1px solid #BBF7D0;',
                'Baixa': 'background: #F2F4F7; color: #344054; border: 1px solid #E4E7EC;'
              };
              const compStyle = compColors[t.complexidade || 'Média'] || compColors['Média'];
              
              const statusLabel = t.status === 'Parcial' ? 'Em Progresso' : 'Pendente';
              const statusBg = t.status === 'Parcial' ? 'background: #FEF3C7; color: #92400E;' : 'background: #F1F5F9; color: #475569;';

              const nameStyles: Record<string, string> = {
                'Amanda': 'background: #F3E8FF; color: #6B21A8; border: 1px solid #E9D5FF;',
                'Bárbara': 'background: #FCE7F3; color: #9D174D; border: 1px solid #FBCFE8;',
                'Daisy': 'background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;'
              };
              const nameStyle = t.responsavel ? (nameStyles[t.responsavel] || 'background: #F1F5F9; color: #475569;') : 'background: transparent; color: #94A3B8;';

              return `
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="padding: 12px 10px; font-size: 13px; color: #64748B; font-weight: bold;">#${idx + 1}</td>
                  <td style="padding: 12px 10px; font-size: 13px; font-weight: 600; color: #0F172A;">
                    ${t.tarefa}
                    ${t.comentario ? `<div style="font-size: 11px; color: #64748B; font-weight: normal; margin-top: 4px; font-style: italic;">↳ Nota: "${t.comentario}"</div>` : ''}
                  </td>
                  <td style="padding: 12px 10px; text-align: center;">
                    <span style="display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; ${statusBg}">${statusLabel}</span>
                  </td>
                  <td style="padding: 12px 10px; text-align: center;">
                    <span style="display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; ${prioStyle}">${t.prioridade || 'Média'}</span>
                  </td>
                  <td style="padding: 12px 10px; text-align: center;">
                    <span style="display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; ${compStyle}">${t.complexidade || 'Média'}</span>
                  </td>
                  <td style="padding: 12px 10px; text-align: center;">
                    <span style="display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; ${nameStyle}">${t.responsavel || '-'}</span>
                  </td>
                  <td style="padding: 12px 10px; text-align: right; font-size: 12px; color: #64748B;">${t.data_criacao ? formatDate(t.data_criacao) : formatDate(t.data)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }

    let completedListHTML = '';
    if (completedTasks.length === 0) {
      completedListHTML = '<p style="font-size: 13px; color: #64748B; font-style: italic; margin-top: 10px;">Nenhuma tarefa concluída ainda.</p>';
    } else {
      completedListHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background: #F8FAFC; border-bottom: 2px solid #E2E8F0; text-align: left;">
              <th style="padding: 10px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; width: 40px;">ID</th>
              <th style="padding: 10px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">Tarefa</th>
              <th style="padding: 10px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; text-align: center; width: 100px;">Prioridade</th>
              <th style="padding: 10px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; text-align: center; width: 120px;">Duração</th>
              <th style="padding: 10px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; text-align: center; width: 110px;">Responsável</th>
              <th style="padding: 10px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; text-align: right; width: 150px;">Concluída em</th>
            </tr>
          </thead>
          <tbody>
            ${completedTasks.map((t, idx) => {
              const priorityColors: Record<string, string> = {
                'Urgente': 'background: #FEE2E2; color: #991B1B;',
                'Alta': 'background: #FFEDD5; color: #9A3412;',
                'Média': 'background: #DBEAFE; color: #1E40AF;',
                'Baixa': 'background: #F1F5F9; color: #334155;'
              };
              const prioStyle = priorityColors[t.prioridade || 'Média'] || priorityColors['Média'];
              const duration = t.data_criacao && t.data_conclusao ? getCompletionDuration(t.data_criacao, t.data_conclusao) : 'Mesmo dia';

              const nameStyles: Record<string, string> = {
                'Amanda': 'background: #F3E8FF; color: #6B21A8; border: 1px solid #E9D5FF;',
                'Bárbara': 'background: #FCE7F3; color: #9D174D; border: 1px solid #FBCFE8;',
                'Daisy': 'background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;'
              };
              const nameStyle = t.responsavel ? (nameStyles[t.responsavel] || 'background: #F1F5F9; color: #475569;') : 'background: transparent; color: #94A3B8;';

              return `
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="padding: 12px 10px; font-size: 13px; color: #64748B; font-weight: bold;">#${idx + 1}</td>
                  <td style="padding: 12px 10px; font-size: 13px; font-weight: 600; color: #0F172A; text-decoration: line-through; opacity: 0.7;">${t.tarefa}</td>
                  <td style="padding: 12px 10px; text-align: center;">
                    <span style="display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; ${prioStyle}">${t.prioridade || 'Média'}</span>
                  </td>
                  <td style="padding: 12px 10px; text-align: center; font-size: 12px; font-weight: bold; color: #166534;">${duration}</td>
                  <td style="padding: 12px 10px; text-align: center;">
                    <span style="display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; ${nameStyle}">${t.responsavel || '-'}</span>
                  </td>
                  <td style="padding: 12px 10px; text-align: right; font-size: 12px; color: #64748B;">${t.data_conclusao ? formatDate(t.data_conclusao) : formatDate(t.data)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório Geral de Tarefas - TarefaSimples</title>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          @media print {
            body { background: white; color: black; }
            .no-print { display: none; }
            tr { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 40px; font-family: 'Inter', sans-serif; color: #1E293B; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
        <div style="max-width: 900px; margin: 0 auto;">
          <!-- Header Corporativo -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 20px; margin-bottom: 30px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="font-size: 20px; font-weight: 900; letter-spacing: 0.15em; color: #0F172A; text-transform: uppercase;">✓ TarefaSimples</span>
              </div>
              <h1 style="font-size: 22px; font-weight: 900; color: #0F172A; margin: 0; letter-spacing: -0.03em;">RELATÓRIO CONSOLIDADO DE PRODUTIVIDADE</h1>
              <p style="font-size: 12px; color: #64748B; margin: 4px 0 0 0; font-weight: 500;">Controle analítico de pendências, prazos e metas realizadas</p>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 9px; text-transform: uppercase; font-weight: 800; color: #64748B; letter-spacing: 0.05em; display: block;">Data de Emissão</span>
              <p style="font-size: 14px; font-weight: 700; color: #0F172A; margin: 2px 0 0 0;">${today}</p>
            </div>
          </div>

          <!-- KPI Cards Grid (Estatísticas) -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 35px;">
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 16px; text-align: center;">
              <span style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.1em; display: block;">Total de Tarefas</span>
              <p style="font-size: 32px; font-weight: 900; color: #0F172A; margin: 6px 0 0 0; letter-spacing: -0.05em;">${totalCount}</p>
            </div>
            <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 16px; padding: 16px; text-align: center;">
              <span style="font-size: 10px; font-weight: 800; color: #065F46; text-transform: uppercase; letter-spacing: 0.1em; display: block;">Concluídas</span>
              <p style="font-size: 32px; font-weight: 900; color: #065F46; margin: 6px 0 0 0; letter-spacing: -0.05em;">${completedCount}</p>
            </div>
            <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 16px; padding: 16px; text-align: center;">
              <span style="font-size: 10px; font-weight: 800; color: #1E40AF; text-transform: uppercase; letter-spacing: 0.1em; display: block;">Pendentes / Ativas</span>
              <p style="font-size: 32px; font-weight: 900; color: #1E40AF; margin: 6px 0 0 0; letter-spacing: -0.05em;">${activeTasksCount}</p>
            </div>
            <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 16px; padding: 16px; text-align: center;">
              <span style="font-size: 10px; font-weight: 800; color: #92400E; text-transform: uppercase; letter-spacing: 0.1em; display: block;">Taxa Conclusão</span>
              <p style="font-size: 32px; font-weight: 900; color: #92400E; margin: 6px 0 0 0; letter-spacing: -0.05em;">${completionRate}%</p>
            </div>
          </div>

          <!-- Distribuição por Prioridade -->
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; margin-bottom: 35px;">
            <h3 style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #475569; margin: 0 0 15px 0;">Distribuição por Prioridade</h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 12px; border-radius: 12px; border: 1px solid #E2E8F0;">
                <span style="font-size: 11px; font-weight: 800; color: #DC2626;">🚨 URGENTE</span>
                <span style="font-size: 16px; font-weight: 900; color: #DC2626;">${priorityStats.Urgente}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 12px; border-radius: 12px; border: 1px solid #E2E8F0;">
                <span style="font-size: 11px; font-weight: 800; color: #EA580C;">⚠️ ALTA</span>
                <span style="font-size: 16px; font-weight: 900; color: #EA580C;">${priorityStats.Alta}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 12px; border-radius: 12px; border: 1px solid #E2E8F0;">
                <span style="font-size: 11px; font-weight: 800; color: #2563EB;">🔹 MÉDIA</span>
                <span style="font-size: 16px; font-weight: 900; color: #2563EB;">${priorityStats.Média}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 12px; border-radius: 12px; border: 1px solid #E2E8F0;">
                <span style="font-size: 11px; font-weight: 800; color: #475569;">▫️ BAIXA</span>
                <span style="font-size: 16px; font-weight: 900; color: #475569;">${priorityStats.Baixa}</span>
              </div>
            </div>
          </div>

          <!-- Tempo Médio -->
          ${completedCount > 0 ? `
          <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 16px; padding: 15px 20px; margin-bottom: 35px; display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 24px;">⚡</div>
            <div>
              <p style="margin: 0; font-size: 14px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.05em;">Tempo Médio de Conclusão</p>
              <p style="margin: 2px 0 0 0; font-size: 13px; color: #14532D; font-weight: 500;">Você está levando em média <strong>${averageCompletionTime} dia(s)</strong> para entregar as tarefas concluídas. Excelente trabalho!</p>
            </div>
          </div>
          ` : ''}

          <!-- Tarefas Ativas / Pendentes -->
          <div style="margin-bottom: 40px; page-break-inside: avoid;">
            <h2 style="font-size: 15px; font-weight: 900; color: #0F172A; border-left: 4px solid #2563EB; padding-left: 10px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: -0.01em;">Ativas & Em Progresso (${activeTasksCount})</h2>
            ${pendingAndPartialListHTML}
          </div>

          <!-- Tarefas Concluídas -->
          <div style="margin-bottom: 40px; page-break-inside: avoid;">
            <h2 style="font-size: 15px; font-weight: 900; color: #0F172A; border-left: 4px solid #10B981; padding-left: 10px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: -0.01em;">Concluídas Recentemente (${completedTasks.length})</h2>
            ${completedListHTML}
          </div>

          <!-- Footer -->
          <div style="text-align: center; border-top: 1px solid #E2E8F0; padding-top: 20px; margin-top: 50px; font-size: 11px; color: #94A3B8; font-weight: 500;">
            Documento emitido eletronicamente via plataforma <strong>TarefaSimples</strong>.
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a hidden iframe
    let iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(reportHtml);
      doc.close();
      
      // Allow fonts and styles to load, then print
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 500);
    }
  };

  // Filter tasks based on search and sort by priority weights
  const filteredPending = React.useMemo(() => {
    const weights: Record<string, number> = { 'Urgente': 4, 'Alta': 3, 'Média': 2, 'Baixa': 1 };
    return tasks
      .filter(t => 
        t.status !== 'Concluída' && 
        t.tarefa.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const aW = weights[a.prioridade || 'Média'] || 2;
        const bW = weights[b.prioridade || 'Média'] || 2;
        if (aW !== bW) return bW - aW;
        const aT = a.data_criacao ? new Date(a.data_criacao).getTime() : 0;
        const bT = b.data_criacao ? new Date(b.data_criacao).getTime() : 0;
        return bT - aT;
      });
  }, [tasks, searchQuery]);

  const filteredCompleted = React.useMemo(() => {
    const weights: Record<string, number> = { 'Urgente': 4, 'Alta': 3, 'Média': 2, 'Baixa': 1 };
    return tasks
      .filter(t => 
        t.status === 'Concluída' && 
        t.tarefa.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const aW = weights[a.prioridade || 'Média'] || 2;
        const bW = weights[b.prioridade || 'Média'] || 2;
        if (aW !== bW) return bW - aW;
        const aT = a.data_conclusao ? new Date(a.data_conclusao).getTime() : 0;
        const bT = b.data_conclusao ? new Date(b.data_conclusao).getTime() : 0;
        return bT - aT;
      });
  }, [tasks, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button 
          className="fixed bottom-6 right-6 h-14 md:h-16 px-6 md:px-8 rounded-full shadow-2xl shadow-primary/40 animate-bounce hover:animate-none group z-40 transition-transform active:scale-95 flex items-center gap-2"
          aria-label="Abrir Relatório Geral"
        />}>
          <ClipboardList className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:rotate-12" />
          <span className="font-black text-xs md:text-sm uppercase tracking-widest">Relatório Geral</span>
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
                                  "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0",
                                  task.prioridade === 'Urgente' && "bg-red-500/10 text-red-500 border-red-500/10 dark:bg-red-500/20",
                                  task.prioridade === 'Alta' && "bg-orange-500/10 text-orange-500 border-orange-500/10 dark:bg-orange-500/20",
                                  task.prioridade === 'Média' && "bg-blue-500/10 text-blue-500 border-blue-500/10 dark:bg-blue-500/20",
                                  task.prioridade === 'Baixa' && "bg-slate-500/10 text-slate-500 border-slate-500/10 dark:bg-slate-500/20"
                                )}>
                                  {task.prioridade}
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
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0",
                                  task.prioridade === 'Urgente' && "bg-red-500/10 text-red-500 border-red-500/10 dark:bg-red-500/20",
                                  task.prioridade === 'Alta' && "bg-orange-500/10 text-orange-500 border-orange-500/10 dark:bg-orange-500/20",
                                  task.prioridade === 'Média' && "bg-blue-500/10 text-blue-500 border-blue-500/10 dark:bg-blue-500/20",
                                  task.prioridade === 'Baixa' && "bg-slate-500/10 text-slate-500 border-slate-500/10 dark:bg-slate-500/20"
                                )}>
                                  {task.prioridade}
                                </span>
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
