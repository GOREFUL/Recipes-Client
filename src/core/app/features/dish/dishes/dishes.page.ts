import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AddDishDialog } from '../../../shared/add-dish-dialog/add-dish.dialog';
import { DishItem } from '../../../shared/dish-item/dish.item';
import { DishSrvc } from '../../../../services/network/dish.service';
import { Dish } from '../../../../models/entities/recipes-api/business/dish.entity';

@Component({
  selector: 'rcps-dishes-page',
  templateUrl: 'dishes.page.html',
  imports: [CommonModule, MatButtonModule, MatIconModule, DishItem],
})
export class DishesPage implements OnInit {
  private readonly matDialog = inject(MatDialog);
  private readonly router = inject(Router);
  public readonly dishSrvc = inject(DishSrvc);

  ngOnInit(): void {
    this.dishSrvc.loadAll();
  }

  onAdd(): void {
    const dialogRef = this.matDialog.open(AddDishDialog, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      disableClose: true,
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((value: Dish | undefined) => {
      if (value) {
        this.dishSrvc.add(value);
      }
    });
  }

  onEdit(dish: Dish): void {
    this.dishSrvc.update(dish);
  }

  onDelete(dish: Dish): void {
    this.dishSrvc.delete(dish.id);
  }

  onRefresh(): void {
    this.dishSrvc.loadAll();
  }

  onSelectDish(dish: Dish): void {
    this.router.navigate(['/dishes', dish.id]);
  }
}
