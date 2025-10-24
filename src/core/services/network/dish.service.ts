/*
 * File        : dish.service.ts
 * Description : Dish Service. Used for CRUD operations.
 * Author      : Kuts Vladyslav Ivanovich
 */

import { Injectable, WritableSignal, signal, inject, Signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Dish } from '../../models/entities/recipes-api/business/dish.entity';

import { environment } from '../../../environments/environment.dev';

@Injectable ({ providedIn: 'root' })
export class DishSrvc
{
  private readonly _baseUrl: string = `${environment.apiUrl}/dishes`

  private readonly _httpClient: HttpClient = inject(HttpClient)

  private readonly _dishes: WritableSignal<Dish[] | undefined> = signal(undefined)

  public get dishes(): Signal<Dish[] | undefined>
  { return this._dishes.asReadonly(); }

  // Load all dishes
  public loadAll(): void
  {
    this._httpClient.get<Dish[]>(this._baseUrl).subscribe
    ({
      next: (dishes) => this._dishes.set(dishes)
    });
  }

  // Add new dish
  public add(value: Dish): void
  {
    this._httpClient.post<Dish>(this._baseUrl, value).subscribe
    ({
      next: () => this.loadAll()
    });
  }

  // Update existing dish
  public update(value: Dish): void
  {
    this._httpClient.put<Dish>(this._baseUrl, value).subscribe
    ({
      next: () =>
      {
        this.loadAll();
      }
    });
  }

  // Delete dish
  public delete(id: number): void
  {
    this._httpClient.delete<void>(this._baseUrl).subscribe
    ({
      next: () =>
      {
        this.loadAll();
      }
    });
  }

  // Get dishes by name
  public get(value: string)
  {
    this._httpClient.get<Dish[]>(this._baseUrl, { params: { target: value } }).subscribe
    ({
      next: (dishes) => this._dishes.set(dishes)
    });
  }
}