import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

import { Dish } from '../../../../models/entities/recipes-api/business/dish.entity';
import { DishSrvc } from '../../../../services/network/dish.service';

@Component({
  selector: 'rcps-dish-details-page',
  standalone: true,
  templateUrl: 'dish-details.page.html',
  imports: [CommonModule, MatIconModule],
})
export class DishDetailsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dishSrvc = inject(DishSrvc);

  dish: Dish | null = null;

  macronutrientKeys = [
    'kcal',
    'saturatedFat',
    'transFat',
    'sugars',
    'fiber',
    'protein',
    'salt',
  ];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')!);
    this.dish = this.dishSrvc.dishes()?.find((d) => d.id === id) || null;
  }

  onBack(): void {
    this.router.navigate(['/dishes']);
  }

  onSelectDish(dish: Dish): void {
    this.router.navigate(['/dishes', dish.id]);
  }
}
