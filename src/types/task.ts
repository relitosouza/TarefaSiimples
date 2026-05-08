export type TaskStatus = 'Pendente' | 'Parcial' | 'Concluída';

export interface Task {
  id: string;
  tarefa: string;
  status: TaskStatus;
  data_criacao: string;
  data_conclusao?: string;
}
