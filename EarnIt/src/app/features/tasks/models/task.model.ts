import { TaskType } from './task-type.enum';

/**
 * Task model representing a single task with its properties
 */
export interface Task {
  id: string;
  title: string;
  type: TaskType;
  value: number; // Euro value
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

