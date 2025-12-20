import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { TaskType } from '../../models/task-type.enum';
import { TaskItemComponent } from '../task-item/task-item.component';
import { AddEditTaskDialogComponent } from '../add-edit-task-dialog/add-edit-task-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Task List Component
 * Displays tasks organized by type (daily/weekly) with tabs
 */
@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    TaskItemComponent,
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly dialog = inject(MatDialog);

  protected readonly tasks$: Observable<Task[]> = this.taskService.getAll();
  protected readonly dailyTasks$: Observable<Task[]> = this.tasks$.pipe(
    map((tasks) => tasks.filter((task) => task.type === TaskType.Daily))
  );
  protected readonly weeklyTasks$: Observable<Task[]> = this.tasks$.pipe(
    map((tasks) => tasks.filter((task) => task.type === TaskType.Weekly))
  );

  protected readonly TaskType = TaskType;

  ngOnInit(): void {
    // Component initialization
  }

  protected openAddTaskDialog(): void {
    const dialogRef = this.dialog.open(AddEditTaskDialogComponent, {
      width: '90%',
      maxWidth: '500px',
      data: null, // null means new task
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService.add(result);
      }
    });
  }

  protected onTaskDeleted(taskId: string): void {
    this.taskService.delete(taskId);
  }

  protected onTaskEdited(task: Task): void {
    const dialogRef = this.dialog.open(AddEditTaskDialogComponent, {
      width: '90%',
      maxWidth: '500px',
      data: task, // Pass existing task for editing
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService.update(task.id, result);
      }
    });
  }

  protected onTaskToggled(taskId: string): void {
    this.taskService.toggleComplete(taskId);
  }
}

