'use server';

import { getSheet } from '@/lib/google-sheets';
import { Task, TaskStatus } from '@/types/task';
import { revalidatePath } from 'next/cache';

export async function getTasks() {
  try {
    const sheet = await getSheet();
    const rows = await sheet.getRows();
    
    const tasks: Task[] = rows.map(row => ({
      id: row.get('ID'),
      tarefa: row.get('Tarefa'),
      status: row.get('Status') as TaskStatus,
      data_criacao: row.get('Data_Criacao'),
      data_conclusao: row.get('Data_Conclusao') || '',
    }));

    // Remove duplicatas para o histórico do autocomplete
    const history = Array.from(new Set(tasks.map(t => t.tarefa))).filter(Boolean);

    return { tasks, history };
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    return { tasks: [], history: [] };
  }
}

export async function addTask(tarefa: string) {
  try {
    const sheet = await getSheet();
    const id = crypto.randomUUID();
    const data_criacao = new Date().toISOString();
    
    await sheet.addRow({
      ID: id,
      Tarefa: tarefa,
      Status: 'Pendente',
      Data_Criacao: data_criacao,
      Data_Conclusao: ''
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Erro ao adicionar tarefa:', error);
    return { success: false, error: 'Falha ao adicionar tarefa' };
  }
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  try {
    const sheet = await getSheet();
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('ID') === id);

    if (row) {
      row.set('Status', status);
      if (status === 'Concluída') {
        row.set('Data_Conclusao', new Date().toISOString());
      } else {
        row.set('Data_Conclusao', '');
      }
      await row.save();
      revalidatePath('/');
      return { success: true };
    }
    return { success: false, error: 'Tarefa não encontrada' };
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    return { success: false, error: 'Falha ao atualizar tarefa' };
  }
}

export async function getDailyReport() {
  try {
    const { tasks } = await getTasks();
    const today = new Date().toISOString().split('T')[0];

    const completedToday = tasks.filter(t => 
      t.status === 'Concluída' && 
      t.data_conclusao?.startsWith(today)
    );

    const pending = tasks.filter(t => t.status === 'Pendente');
    const partial = tasks.filter(t => t.status === 'Parcial');

    return {
      completedCount: completedToday.length,
      pendingCount: pending.length,
      partialCount: partial.length,
      tasks: completedToday
    };
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return null;
  }
}
