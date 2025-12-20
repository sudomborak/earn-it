import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RewardProgressComponent } from '../rewards/components/reward-progress/reward-progress.component';
import { TaskListComponent } from '../tasks/components/task-list/task-list.component';

/**
 * Home Component
 * Main page displaying reward progress and task list
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RewardProgressComponent, TaskListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}

