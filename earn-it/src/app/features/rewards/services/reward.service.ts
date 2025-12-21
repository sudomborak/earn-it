import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reward } from '../models/reward.model';
import { TaskService } from '../../tasks/services/task.service';

/**
 * Mock Reward Service
 * Manages active reward and calculates progress from completed tasks
 */
@Injectable({
  providedIn: 'root',
})
export class RewardService {
  private readonly taskService = inject(TaskService);
  private readonly rewardSubject = new BehaviorSubject<Reward | null>(null);
  public readonly reward$: Observable<Reward | null> = this.rewardSubject.asObservable();

  /**
   * Observable that calculates progress percentage
   */
  public readonly progress$: Observable<number> = combineLatest([
    this.reward$,
    this.taskService.tasks$,
  ]).pipe(
    map(([reward, tasks]) => {
      if (!reward) return 0;
      const completedValue = tasks
        .filter((task) => task.completed)
        .reduce((sum, task) => sum + task.value, 0);
      const progress = Math.min((completedValue / reward.price) * 100, 100);
      return Math.round(progress);
    })
  );

  /**
   * Observable that calculates earned amount
   */
  public readonly earnedAmount$: Observable<number> = this.taskService.tasks$.pipe(
    map((tasks) =>
      tasks
        .filter((task) => task.completed)
        .reduce((sum, task) => sum + task.value, 0)
    )
  );

  constructor() {
    // Initialize with mock data
    this.initializeMockData();
  }

  /**
   * Get active reward
   */
  getActiveReward(): Observable<Reward | null> {
    return this.reward$;
  }

  /**
   * Get active reward synchronously
   */
  getReward(): Reward | null {
    return this.rewardSubject.value;
  }

  /**
   * Update or set active reward
   */
  updateReward(reward: Partial<Reward> & { name: string; price: number }): void {
    const currentReward = this.rewardSubject.value;
    const updatedReward: Reward = {
      id: currentReward?.id || this.generateId(),
      name: reward.name,
      price: reward.price,
      earned: this.calculateEarnedAmount(),
      earnedAt: currentReward?.earnedAt,
    };

    // Check if reward is earned
    if (updatedReward.earned >= updatedReward.price && !updatedReward.earnedAt) {
      updatedReward.earnedAt = new Date();
    }

    this.rewardSubject.next(updatedReward);
    this.saveToLocalStorage();
  }

  /**
   * Calculate progress percentage
   */
  calculateProgress(): number {
    const reward = this.rewardSubject.value;
    if (!reward) return 0;

    const earned = this.calculateEarnedAmount();
    const progress = Math.min((earned / reward.price) * 100, 100);
    return Math.round(progress);
  }

  /**
   * Check if reward is earned
   */
  isRewardEarned(): boolean {
    const reward = this.rewardSubject.value;
    if (!reward) return false;
    return this.calculateEarnedAmount() >= reward.price;
  }

  /**
   * Calculate earned amount from completed tasks
   */
  private calculateEarnedAmount(): number {
    return this.taskService.getCompletedValue();
  }

  /**
   * Initialize with mock data
   */
  private initializeMockData(): void {
    const savedReward = this.loadFromLocalStorage();
    if (savedReward) {
      const reward: Reward = {
        ...savedReward,
        earned: this.calculateEarnedAmount(),
        earnedAt: savedReward.earnedAt ? new Date(savedReward.earnedAt) : undefined,
      };
      this.rewardSubject.next(reward);
    } else {
      // Seed initial mock data
      const mockReward: Reward = {
        id: '1',
        name: 'Wireless Headphones',
        price: 120,
        earned: this.calculateEarnedAmount(),
      };
      this.rewardSubject.next(mockReward);
      this.saveToLocalStorage();
    }

    // Update earned amount when tasks change
    this.taskService.tasks$.subscribe(() => {
      const currentReward = this.rewardSubject.value;
      if (currentReward) {
        const earned = this.calculateEarnedAmount();
        const updatedReward: Reward = {
          ...currentReward,
          earned,
          earnedAt:
            earned >= currentReward.price && !currentReward.earnedAt
              ? new Date()
              : currentReward.earnedAt,
        };
        this.rewardSubject.next(updatedReward);
        this.saveToLocalStorage();
      }
    });
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
   * Save reward to localStorage (mock persistence)
   */
  private saveToLocalStorage(): void {
    if (!this.isBrowser()) return;
    try {
      const reward = this.rewardSubject.value;
      if (reward) {
        localStorage.setItem('earnIt_reward', JSON.stringify(reward));
      }
    } catch (error) {
      console.error('Failed to save reward to localStorage:', error);
    }
  }

  /**
   * Load reward from localStorage
   */
  private loadFromLocalStorage(): Reward | null {
    if (!this.isBrowser()) return null;
    try {
      const saved = localStorage.getItem('earnIt_reward');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load reward from localStorage:', error);
      return null;
    }
  }
}

