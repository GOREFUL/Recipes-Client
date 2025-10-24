import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'rcps-add-dish-dialog',
  standalone: true,
  templateUrl: 'add-dish.dialog.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class AddDishDialog {
  private readonly _dialogRef = inject(MatDialogRef<AddDishDialog>);
  private readonly _fb = inject(FormBuilder);

  readonly formGroup = this._fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    time: [0, [Validators.min(0)]],        // minutes
    yield: [1, [Validators.min(1)]],       // portions
    servingSize: [1, [Validators.min(1)]], // grams
    note: ['', [Validators.maxLength(120)]],
  });

  get f() { return this.formGroup.controls; }

  onSubmit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this._dialogRef.close(this.formGroup.value);
  }

  onClose(): void {
    this._dialogRef.close();
  }
}
