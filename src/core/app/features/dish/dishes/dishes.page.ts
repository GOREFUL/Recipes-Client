// src/core/app/features/dish/dishes/dishes.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AddDishDialog } from '../../../shared/add-dish-dialog/add-dish.dialog';
import { DishItem } from '../../../shared/dish-item/dish.item';
import { DishSrvc } from '../../../../services/network/dish.service';
import { MyDish } from '../../../../services/network/dish.service';

@Component({
  selector: 'rcps-dishes-page',
  templateUrl: 'dishes.page.html',
  imports: [CommonModule, MatButtonModule, MatIconModule, DishItem],
})
export class DishesPage implements OnInit {
  private dialog = inject(MatDialog);
  private router = inject(Router);
  public dishSrvc = inject(DishSrvc);

  ngOnInit(): void {
    this.dishSrvc.loadAll();
  }

  onAdd(): void {
    const ref = this.dialog.open(AddDishDialog, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      disableClose: true,
      panelClass: 'custom-dialog-container',
    });

    // Диалог сам делает create; здесь просто рефрешим список
    ref.afterClosed().subscribe(() => this.dishSrvc.loadAll());
     this.router.navigate(['/dishes']);
  }

    onOpen(d: MyDish): void {
    this.router.navigate(['/dishes', d.id]);
  }

  onDelete(d: MyDish): void {
    this.dishSrvc.delete(d.id).subscribe({
      next: () => this.dishSrvc.loadAll(),
      error: (e) => console.warn('Delete failed', e),
    });
  }
  onRefresh(): void {
    this.dishSrvc.loadAll();
  }

  onSelectDish(dish: any): void {
    this.router.navigate(['/dishes', dish.id]);
  }

  trackById = (_: number, d: any) => d?.id;
}
