/*
 * Files        : dishes.page.ts, dishes.page.html
 * Description  : Dishes page. Gives possibility to operate dishes
 * Author       : Kuts Vladyslav Ivanovich
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AddDishDialog } from '../../../shared/add-dish-dialog/add-dish.dialog';

import { DishItem } from '../../../shared/dish-item/dish.item';

import { DishSrvc } from '../../../../services/network/dish.service';

import { Dish } from '../../../../models/entities/recipes-api/business/dish.entity';
import { MatDialog } from '@angular/material/dialog';

@Component
({
  selector: 'rcps-dishes-page',
  templateUrl: 'dishes.page.html',
  imports:
  [
    CommonModule,

    MatButtonModule,
    MatIconModule,

    DishItem
  ]
})
export class DishesPage implements OnInit
{
  private readonly matDialog: MatDialog = inject(MatDialog)

  public readonly dishSrvc: DishSrvc = inject(DishSrvc)
  
  public ngOnInit(): void
  {
    this.dishSrvc.loadAll();
  }

  public onAdd(): void
{
  const dialogRef = this.matDialog.open(AddDishDialog, {
    width: '90vw',  
    maxWidth: '1200px', 
    height: '90vh', 
    disableClose: true,
    panelClass: 'custom-dialog-container'
  });

  dialogRef.afterClosed().subscribe((value: Dish | undefined) =>
  {
    if (value) {
      this.dishSrvc.add(value);
    }
  });
}

  public onEdit(dish: Dish): void
  {
    this.dishSrvc.update(dish);
  }

  public onDelete(dish: Dish): void
  {
    this.dishSrvc.delete(dish.id);
  }

  public onRefresh(): void
  {
    this.dishSrvc.loadAll();
  }
}