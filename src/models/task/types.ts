

export interface Task {
  id_task?: number;
  id_user?: number;
  title: string;
  description?: string;
  due_date?: string;
  status: 'PENDIENTE' | 'COMPLETADO' | 'OBSERVADO';
  created_at?: string;
  updated_at?: string;
}



export interface TaskResponse extends Task {
}


