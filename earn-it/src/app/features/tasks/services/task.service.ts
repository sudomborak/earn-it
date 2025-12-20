import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { TaskType } from '../models/task-type.enum';

/**
 * Mock Task Service
 * Manages tasks state with RxJS BehaviorSubject
 * Ready for backend integration
 */
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  public readonly tasks$: Observable<Task[]> = this.tasksSubject.asObservable();

  constructor() {
    // Initialize with mock data
    this.initializeMockData();
  }

  /**
   * Get all tasks as observable
   */
  getAll(): Observable<Task[]> {
    return this.tasks$;
  }

  /**
   * Get all tasks synchronously
   */
  getTasks(): Task[] {
    return this.tasksSubject.value;
  }

  /**
   * Add a new task
   */
  add(task: Omit<Task, 'id' | 'createdAt' | 'completed'>): void {
    const newTask: Task = {
      ...task,
      id: this.generateId(),
      createdAt: new Date(),
      completed: false,
    };
    const currentTasks = this.tasksSubject.value;
    this.tasksSubject.next([...currentTasks, newTask]);
    this.saveToLocalStorage();
  }

  /**
   * Update an existing task
   */
  update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): void {
    const currentTasks = this.tasksSubject.value;
    const updatedTasks = currentTasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    );
    this.tasksSubject.next(updatedTasks);
    this.saveToLocalStorage();
  }

  /**
   * Delete a task
   */
  delete(id: string): void {
    const currentTasks = this.tasksSubject.value;
    const filteredTasks = currentTasks.filter((task) => task.id !== id);
    this.tasksSubject.next(filteredTasks);
    this.saveToLocalStorage();
  }

  /**
   * Toggle task completion status
   */
  toggleComplete(id: string): void {
    const currentTasks = this.tasksSubject.value;
    const updatedTasks = currentTasks.map((task) => {
      if (task.id === id) {
        const completed = !task.completed;
        return {
          ...task,
          completed,
          completedAt: completed ? new Date() : undefined,
        };
      }
      return task;
    });
    this.tasksSubject.next(updatedTasks);
    this.saveToLocalStorage();
  }

  /**
   * Get tasks by type
   */
  getTasksByType(type: TaskType): Task[] {
    return this.tasksSubject.value.filter((task) => task.type === type);
  }

  /**
   * Get total value of completed tasks
   */
  getCompletedValue(): number {
    return this.tasksSubject.value
      .filter((task) => task.completed)
      .reduce((sum, task) => sum + task.value, 0);
  }

  /**
   * Mock daily reset - resets daily tasks
   */
  resetDailyTasks(): void {
    const currentTasks = this.tasksSubject.value;
    const updatedTasks = currentTasks.map((task) => {
      if (task.type === TaskType.Daily) {
        return {
          ...task,
          completed: false,
          completedAt: undefined,
        };
      }
      return task;
    });
    this.tasksSubject.next(updatedTasks);
    this.saveToLocalStorage();
  }

  /**
   * Mock weekly reset - resets weekly tasks
   */
  resetWeeklyTasks(): void {
    const currentTasks = this.tasksSubject.value;
    const updatedTasks = currentTasks.map((task) => {
      if (task.type === TaskType.Weekly) {
        return {
          ...task,
          completed: false,
          completedAt: undefined,
        };
      }
      return task;
    });
    this.tasksSubject.next(updatedTasks);
    this.saveToLocalStorage();
  }

  /**
   * Initialize with mock data
   */
  private initializeMockData(): void {
    const savedTasks = this.loadFromLocalStorage();
    if (savedTasks && savedTasks.length > 0) {
      // Convert date strings back to Date objects
      const tasks = savedTasks.map((task) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      }));
      this.tasksSubject.next(tasks);
    } else {
      // Seed initial mock data
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Morning workout',
          type: TaskType.Daily,
          value: 5,
          completed: false,
          createdAt: new Date(),
        },
        {
          id: '2',
          title: 'Read for 30 minutes',
          type: TaskType.Daily,
          value: 3,
          completed: true,
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: '3',
          title: 'Complete project milestone',
          type: TaskType.Weekly,
          value: 15,
          completed: false,
          createdAt: new Date(),
        },
        {
          id: '4',
          title: 'Weekly review meeting',
          type: TaskType.Weekly,
          value: 10,
          completed: false,
          createdAt: new Date(),
        },
      ];
      this.tasksSubject.next(mockTasks);
      this.saveToLocalStorage();
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Check if running in browser environment
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Save tasks to localStorage (mock persistence)
   */
  private saveToLocalStorage(): void {
    if (!this.isBrowser()) return;
    try {
      const tasks = this.tasksSubject.value;
      localStorage.setItem('earnIt_tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks to localStorage:', error);
    }
  }

  /**
   * Load tasks from localStorage
   */
  private loadFromLocalStorage(): Task[] | null {
    if (!this.isBrowser()) return null;
    try {
      const saved = localStorage.getItem('earnIt_tasks');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load tasks from localStorage:', error);
      return null;
    }
  }
}

