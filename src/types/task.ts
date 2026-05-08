export type TaskStatus = 'Pendente' | 'Parcial' | 'Concluída';

export interface Task {
  id: string;
  tarefa: string;
  status: TaskStatus;
  comentario?: string;
  data: string;
  data_criacao: string;
  data_conclusao?: string;
}
