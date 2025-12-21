import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Task } from '../../models/task.model';
import { TaskType } from '../../models/task-type.enum';

/**
 * Task Item Component
 * Displays a single task with completion checkbox and actions
 */
@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Task;
  @Output() taskDeleted = new EventEmitter<string>();
  @Output() taskEdited = new EventEmitter<Task>();
  @Output() taskToggled = new EventEmitter<string>();

  protected readonly TaskType = TaskType;

  protected onToggleComplete(): void {
    this.taskToggled.emit(this.task.id);
  }

  protected onEdit(): void {
    this.taskEdited.emit(this.task);
  }

  protected onDelete(): void {
    if (confirm(`Are you sure you want to delete "${this.task.title}"?`)) {
      this.taskDeleted.emit(this.task.id);
    }
  }
}

