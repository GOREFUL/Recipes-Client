import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

import { ModelFactory } from '../../../factories/model.factory';
import { Dish } from '../../../models/entities/recipes-api/business/dish.entity';
import { Ingredient } from '../../../models/entities/recipes-api/business/ingredient.entity';
import { Image } from '../../../models/entities/recipes-api/business/image.entity';
import { Allergy } from '../../../models/entities/recipes-api/business/allergy.entity';
import { Cuisine } from '../../../models/entities/recipes-api/business/cuisine.entity';

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
export class AddDishDialog {
  private readonly _dialogRef = inject(MatDialogRef<AddDishDialog>);
  private readonly _fb = inject(FormBuilder);

  availableAllergies: Allergy[] = [
    { name: 'Gluten' },
    { name: 'Peanuts' },
    { name: 'Lactose' },
  ];

  availableCuisines: Cuisine[] = [
    { name: 'Italian' },
    { name: 'Japanese' },
    { name: 'Ukrainian' },
    { name: 'Mexican' },
  ];

  macronutrientFields = [
    'Kcal',
    'SaturatedFat',
    'TransFat',
    'Sugars',
    'Fiber',
    'Protein',
    'Salt',
  ];

  availableIngredients: string[] = [
    'Tomato',
    'Cheese',
    'Chicken Breast',
    'Rice',
    'Pasta',
    'Milk',
    'Salt',
    'Sugar',
  ];
  
  availableMeasures: string[] = [
    'g',
    'kg',
    'ml',
    'l',
    'pcs',
    'tbsp',
    'tsp',
  ];

  formGroup = this._fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    cuisines: [[]],
    allergies: [[]],

    ingredients: this._fb.array([]),
    images: this._fb.array([]),

    kcal: ['0'],
    saturatedFat: ['0'],
    transFat: ['0'],
    sugars: ['0'],
    fiber: ['0'],
    protein: ['0'],
    salt: ['0'],

    time: [''],
    yieldVal: ['0'],
    servingSize: ['0'],
    note: [''],
  });

  get ingredients(): FormArray {
    return this.formGroup.get('ingredients') as FormArray;
  }

  get images(): FormArray {
    return this.formGroup.get('images') as FormArray;
  }

  // Добавление ингредиента
  addIngredient(): void {
    const ing = this._fb.group({
      name: [''],
      measure: [''],
      value: ['0'],
    });
    this.ingredients.push(ing);
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
  }

  // Добавление изображения
  addImage(): void {
    const img = this._fb.group({
      image: [''],
      description: [''],
    });
    this.images.push(img);
  }

  removeImage(index: number): void {
    this.images.removeAt(index);
  }

  onSubmit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
  
    const v = this.formGroup.value;
  
    const rawIngredients = (v.ingredients || []) as Array<{ name?: string; value?: any; measure?: string }>;
    const rawImages = (v.images || []) as Array<{ image?: string; description?: string }>;
    const rawAllergies = (v.allergies || []) as Array<string>;
    const rawCuisines = (v.cuisines || []) as Array<string>;
  
    const ingredients = rawIngredients.map(i =>
      ModelFactory.createIngredient(i.name || '', Number(i.value || 0), i.measure || '')
    );
  
    const images = rawImages.map(i =>
      ModelFactory.createImage(i.image || '', i.description || '')
    );
  
    const allergies = rawAllergies.map(a => ModelFactory.createAllergy(a || ''));
  
    const cuisines = rawCuisines.map(c => ModelFactory.createCuisine(c || ''));
  
    const dish: Dish = ModelFactory.createDish(
      0,
      v.name!,
      v.description || '',
      ModelFactory.createCookInfo(
        v.time || '',
        Number(v.yieldVal),
        Number(v.servingSize),
        v.note || ''
      ),
      ModelFactory.createMacronutrients(
        Number(v.kcal),
        Number(v.saturatedFat),
        Number(v.transFat),
        Number(v.sugars),
        Number(v.fiber),
        Number(v.protein),
        Number(v.salt)
      ),
      ingredients,
      images,
      allergies,
      cuisines
    );
  
    this._dialogRef.close(dish);
  }
  

  onClose(): void {
    this._dialogRef.close();
  }
}
