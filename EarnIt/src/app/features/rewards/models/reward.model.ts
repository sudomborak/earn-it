/**
 * Reward model representing a single reward goal
 */
export interface Reward {
  id: string;
  name: string;
  price: number; // Target price in euros
  earned: number; // Amount earned so far
  earnedAt?: Date; // When the reward was earned
}

