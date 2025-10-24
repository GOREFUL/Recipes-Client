import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Dish } from '../../../models/entities/recipes-api/business/dish.entity';
import { ModelFactory } from '../../../factories/model.factory';

@Component({
  selector: 'rcps-edit-dish-dialog',
  standalone: true,
  templateUrl: 'edit-dish.dialog.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class EditDishDialog {
  private readonly _dialogRef = inject(MatDialogRef<EditDishDialog>);
  private readonly _fb = inject(FormBuilder);
  private readonly _data = inject(MAT_DIALOG_DATA) as Dish;

  readonly formGroup = this._fb.group({
    name: [this._data?.name ?? '', [Validators.required, Validators.maxLength(100)]],
    description: [this._data?.description ?? '', [Validators.maxLength(500)]],
    time: [this._data?.cookInfo?.time ?? 0, [Validators.min(0)]],
    yield: [this._data?.cookInfo?.yield ?? 1, [Validators.min(1)]],
    servingSize: [this._data?.cookInfo?.servingSize ?? 1, [Validators.min(1)]],
    note: [this._data?.cookInfo?.note ?? '', [Validators.maxLength(120)]],
  });

  get f() { return this.formGroup.controls; }

  onSubmit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const v = this.formGroup.value;
    const updatedDish: Dish = ModelFactory.createDish(
      this._data.id,
      v.name!,
      v.description || '',
  ModelFactory.createCookInfo(
    String(v.time ?? ''),                 // <-- строка
    Number(v.yield) || 1,                // числа
    Number(v.servingSize) || 1,
    v.note || ''
  ),
      this._data.macronutrients,
      this._data.micronutrients,
      this._data.steps,
      this._data.images
    );
    this._dialogRef.close(updatedDish);
  }

  onClose(): void { this._dialogRef.close(); }
}
