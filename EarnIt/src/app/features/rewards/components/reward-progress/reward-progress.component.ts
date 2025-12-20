import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { RewardService } from '../../services/reward.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Reward Progress Component
 * Displays the active reward goal and progress bar
 */
@Component({
  selector: 'app-reward-progress',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './reward-progress.component.html',
  styleUrl: './reward-progress.component.scss',
})
export class RewardProgressComponent {
  private readonly rewardService = inject(RewardService);
  private readonly dialog = inject(MatDialog);

  protected readonly reward$ = this.rewardService.getActiveReward();
  protected readonly progress$ = this.rewardService.progress$;
  protected readonly earnedAmount$ = this.rewardService.earnedAmount$;

  protected readonly isRewardEarned$: Observable<boolean> = this.progress$.pipe(
    map((progress) => progress >= 100)
  );

  protected readonly remainingAmount$: Observable<number> = this.reward$.pipe(
    map((reward) => {
      if (!reward) return 0;
      return Math.max(0, reward.price - reward.earned);
    })
  );

  protected onEditReward(): void {
    // Future: Open dialog to edit reward
    // For now, we'll just show prompts
    const reward = this.rewardService.getReward();
    const currentName = reward?.name || '';
    const currentPrice = reward?.price || 0;
    
    const newName = prompt('Enter reward name:', currentName);
    if (newName === null) return; // User cancelled
    
    const newPriceStr = prompt('Enter reward price (€):', currentPrice.toString());
    if (newPriceStr === null) return; // User cancelled
    
    const newPrice = parseFloat(newPriceStr);
    if (!isNaN(newPrice) && newPrice > 0) {
      this.rewardService.updateReward({
        name: newName,
        price: newPrice,
      });
    } else {
      alert('Please enter a valid price greater than 0');
    }
  }
}

