import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { Task } from '../../models/task.model';
import { TaskType } from '../../models/task-type.enum';

/**
 * Add/Edit Task Dialog Component
 * Dialog for creating or editing tasks
 */
@Component({
  selector: 'app-add-edit-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
  ],
  templateUrl: './add-edit-task-dialog.component.html',
  styleUrl: './add-edit-task-dialog.component.scss',
})
export class AddEditTaskDialogComponent implements OnInit {
  taskForm!: FormGroup;
  isEditMode = false;

  protected readonly TaskType = TaskType;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<AddEditTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Task | null
  ) {
    this.isEditMode = !!data;
  }

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title: [this.data?.title || '', [Validators.required, Validators.minLength(3)]],
      type: [this.data?.type || TaskType.Daily, Validators.required],
      value: [
        this.data?.value || 0,
        [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)],
      ],
    });
  }

  /**
   * Handle number input to remove leading zeros
   * Example: "044" → "44", "05.50" → "5.50"
   */
  protected onValueInput(event: Event): void {
    console.log('onValueInput', event);
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remove leading zeros (but keep single zero or "0.")
    if (value.length > 1 && value.startsWith('0')) {
      // Allow "0." while user is typing decimals
      if (value === '0.') {
        // Keep "0." as is
        return;
      }
      
      // Remove leading zero(s) - handles both "044" and "05.50"
      // Match: one or more zeros at the start, but not if followed by nothing or just a decimal
      value = value.replace(/^0+(?=\d)/, '');
      
      // If we removed everything or result is empty, keep "0"
      if (value === '' || value === '.') {
        value = '0';
      }
    }

    // Update the input value and form control only if value changed
    if (input.value !== value) {
      const numValue = value === '' || value === '.' || value === '0.' ? 0 : parseFloat(value);
      
      // Update form control if it's a valid number (not intermediate states like "0.")
      if (value !== '' && value !== '.' && value !== '0.' && !isNaN(numValue)) {
        this.taskForm.patchValue({ value: numValue }, { emitEvent: false });
      }
      
      // Update the input field display
      setTimeout(() => {
        input.value = value;
      }, 0);
    }
  }

  protected onSubmit(): void {
    if (this.taskForm.valid) {
      this.dialogRef.close(this.taskForm.value);
    }
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected getErrorMessage(fieldName: string): string {
    const field = this.taskForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('minlength')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least 3 characters`;
    }
    if (field?.hasError('min')) {
      return 'Value must be greater than 0';
    }
    if (field?.hasError('pattern')) {
      return 'Please enter a valid number (e.g., 5 or 5.50)';
    }
    return '';
  }
}

