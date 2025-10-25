// src/core/app/shared/add-dish-dialog/add-dish.dialog.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';

import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

import { HttpErrorResponse } from '@angular/common/http';
import { DishSrvc } from '../../../services/network/dish.service';
import { LookupsSrvc, Lookup } from '../../../services/network/lookups.service';

// === DTO, которое ждёт бэкенд на POST /api/dishes ===
type CreateDishDto = {
  name: string;
  description?: string;
  info: {
    levelId: number;         // <- levelId внутри info
    time: string;            // 'HH:mm:ss'
    yield: number;
    servingSize: number;
    note?: string;
    macros: {
      kcal: number;
      saturatedFat: number;
      transFat: number;
      sugars: number;
      fiber: number;
      protein: number;
      salt: number;
    };
  };
  ingredients: Array<{
    ingredientId: number;
    measurementUnitId: number;
    value: number;
  }>;
  imageUrls: Array<{ url: string }>;
  allergyIds: number[];
  cuisineIds: number[];
};

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
    MatSelectModule,
    MatOptionModule,
  ],
})
export class AddDishDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<AddDishDialog, boolean>);
  private fb = inject(FormBuilder);
  private lookups = inject(LookupsSrvc);
  private dishApi = inject(DishSrvc);

  // --- Lookups ---
  ingredientsLkp: Lookup[] = [];
  unitsLkp: Lookup[] = [];
  allergiesLkp: Lookup[] = [];
  cuisinesLkp: Lookup[] = [];
  levelsLkp: Lookup[] = [];

  macronutrientFields = [
    'kcal',
    'saturatedFat',
    'transFat',
    'sugars',
    'fiber',
    'protein',
    'salt',
  ];

  // --- Форма ---
  formGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],

    levelId: [null as number | null, Validators.required],
    allergyIds: this.fb.control<number[]>([]),
    cuisineIds: this.fb.control<number[]>([]),

    // списки
    ingredients: this.fb.array([] as FormGroup[]),
    images: this.fb.array([] as FormGroup[]),

    // макросы
    kcal: ['0'],
    saturatedFat: ['0'],
    transFat: ['0'],
    sugars: ['0'],
    fiber: ['0'],
    protein: ['0'],
    salt: ['0'],

    // cook info
    time: [''],          // input[type=time] вернёт 'HH:mm'
    yieldVal: ['0'],
    servingSize: ['0'],
    note: [''],
  });

  // --- геттеры для массивов формы ---
  get ingredientsFA(): FormArray<FormGroup> {
    return this.formGroup.get('ingredients') as FormArray<FormGroup>;
  }
  get imagesFA(): FormArray<FormGroup> {
    return this.formGroup.get('images') as FormArray<FormGroup>;
  }

  // --- init ---
  ngOnInit(): void {
    this.lookups.levels().subscribe(v => (this.levelsLkp = v));
    this.lookups.allergies().subscribe(v => (this.allergiesLkp = v));
    this.lookups.cuisines().subscribe(v => (this.cuisinesLkp = v));
    this.lookups.measureUnits().subscribe(v => (this.unitsLkp = v));

    // ВАЖНО: ingredients — пагинированный ответ, нужен .items
this.lookups.ingredients('', 1, 200).subscribe(v => (this.ingredientsLkp = v));
  }

  onIngredientSearch(q: string) {
this.lookups.ingredients(q, 1, 50).subscribe(v => (this.ingredientsLkp = v));
  }

  // ====== И Н Г Р Е Д И Е Н Т Ы ======
  addIngredient(): void {
    this.ingredientsFA.push(
      this.fb.group({
        ingredientId: [null, Validators.required],
        measurementUnitId: [null, Validators.required],
        value: [0, [Validators.required, Validators.min(0)]],
      })
    );
  }

  removeIngredient(i: number): void {
    this.ingredientsFA.removeAt(i);
  }

  // ====== И З О Б Р А Ж Е Н И Я ======
  addImage(): void {
    this.imagesFA.push(
      this.fb.group({
        url: ['', [Validators.required]],
        // описание можно держать для UI, но на бэкенд не уходит
        description: [''],
      })
    );
  }

  removeImage(i: number): void {
    this.imagesFA.removeAt(i);
  }

  // ====== SUBMIT ======
  onSubmit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const v = this.formGroup.value;

    const ingredients = this.ingredientsFA.controls.map(g => ({
      ingredientId: Number(g.value.ingredientId),
      measurementUnitId: Number(g.value.measurementUnitId),
      value: Number(g.value.value) || 0,
    }));

    const imageUrls = this.imagesFA.controls
      .map(g => (g.value.url || '').trim())
      .filter(Boolean)
      .map(url => ({ url }));

    // input[type="time"] даёт 'HH:mm' — дополнить до 'HH:mm:ss'
    const rawTime = (v.time as string) || '00:00';
    const time = rawTime.length === 5 ? `${rawTime}:00` : rawTime;

    const dto: CreateDishDto = {
      name: (v.name || '').trim(),
      description: (v.description || '').trim(),
      info: {
        levelId: Number(v.levelId), // <- переносим levelId сюда
        time,
        yield: Number(v.yieldVal) || 0,
        servingSize: Number(v.servingSize) || 0,
        note: (v.note || '').trim(),
        macros: {
          kcal: Number(v.kcal) || 0,
          saturatedFat: Number(v.saturatedFat) || 0,
          transFat: Number(v.transFat) || 0,
          sugars: Number(v.sugars) || 0,
          fiber: Number(v.fiber) || 0,
          protein: Number(v.protein) || 0,
          salt: Number(v.salt) || 0,
        },
      },
      ingredients,
      imageUrls,
      allergyIds: (v.allergyIds as number[]) || [],
      cuisineIds: (v.cuisineIds as number[]) || [],
    };

this.dishApi.create(dto).subscribe({
  next: () => this.dialogRef.close(true),   // закрываем молча при успехе
  error: () => this.dialogRef.close(false), // закрываем молча и при ошибке
});


  }

  onClose(): void {
    this.dialogRef.close();
  }
}
