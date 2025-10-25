/*
 * File        : dish.service.ts
 * Description : Dishes API — список «моих» блюд + создание/детали/удаление.
 */

import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.dev';
import { Observable, map } from 'rxjs';

/** Элемент списка из /api/Dishes/my */
export interface MyDish {
  id: number;
  userId?: string;
  name: string;
  description?: string;
  createdAt?: string;
  isFavorite?: boolean;
}

/** DTO создания: levelId находится ВНУТРИ info */
export interface CreateDishDto {
  name: string;
  description?: string;
  info: {
    levelId: number;          // внутри info
    time?: string;            // 'HH:mm:ss'
    yield?: number;
    servingSize?: number;
    note?: string;
    macros: {
      kcal?: number;
      saturatedFat?: number;
      transFat?: number;
      sugars?: number;
      fiber?: number;
      protein?: number;
      salt?: number;
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
}

/** Детали блюда. Поля оставлены опциональными, чтобы не падать при расхождениях. */
export interface DishDetails {
  id: number;
  name: string;
  description?: string;
  images?: Array<{ url?: string; image?: string; description?: string }>;
  ingredients?: Array<{
    ingredientId?: number;
    name?: string;
    measurementUnitId?: number;
    measure?: string;
    value?: number;
  }>;
  cuisines?: Array<{ id?: number; name?: string }>;
  allergies?: Array<{ id?: number; name?: string }>;
  macronutrients?: Record<string, number>;
  cookInfo?: {
    time?: string;
    yieldVal?: number;
    servingSize?: number;
    note?: string;
  };
}

type Paged<T> = { items: T[]; total: number; page: number; pageSize: number };

@Injectable({ providedIn: 'root' })
export class DishSrvc {
  private http = inject(HttpClient);

  private readonly base      = `${environment.apiUrl}/Dishes`;
  private readonly listUrl   = `${this.base}/my`;         // GET  /api/Dishes/my
  private readonly createUrl = `${this.base}/dishes`;     // POST /api/Dishes/dishes
  private readonly byIdUrl   = (id: number | string) => `${this.base}/${id}`;           // GET / DELETE
  private readonly detailsUrl= (id: number | string) => `${this.base}/${id}/details`;   // GET

  /** signal со списком блюд */
  private _dishes: WritableSignal<MyDish[]> = signal<MyDish[]>([]);
  /** чтение списка */
  public dishes(): MyDish[] { return this._dishes(); }

  /** привести ответ к массиву (поддержка и массива, и {items:[]}) */
  private toArray<T>(x: any): T[] {
    if (Array.isArray(x)) return x as T[];
    if (x && Array.isArray(x.items)) return x.items as T[];
    return [];
  }

  /** загрузить список «моих» блюд */
  loadAll(opts?: { name?: string; page?: number; pageSize?: number }): void {
    let params = new HttpParams();
    if (opts?.name)     params = params.set('name', opts.name);
    if (opts?.page)     params = params.set('page', String(opts.page));
    if (opts?.pageSize) params = params.set('pageSize', String(opts.pageSize));

    this.http.get<Paged<MyDish> | MyDish[]>(this.listUrl, { params }).subscribe({
      next: res => this._dishes.set(this.toArray<MyDish>(res)),
      error: err => {
        console.warn('Dishes load error:', err);
        this._dishes.set([]);
      },
    });
  }

  /** создать блюдо — backend возвращает id числом в text/plain */
  create(dto: CreateDishDto): Observable<number> {
    return this.http
      .post(this.createUrl, dto, { responseType: 'text' })
      .pipe(map(t => Number(t)));
  }

  /** получить детальную карточку блюда */
getDetails(id: number) {
  return this.http.get<any>(this.detailsUrl(id));
}
  /** получить упрощённую карточку по id (если нужно) */
  getById(id: number): Observable<MyDish> {
    return this.http.get<MyDish>(this.byIdUrl(id));
  }

  /** удалить блюдо */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.byIdUrl(id));
  }

  /** совместимость со старым названием */
  add(dto: CreateDishDto): Observable<number> { return this.create(dto); }
  
getMyOnce() {
  return this.http.get<MyDish[]>(`${environment.apiUrl}/Dishes/my`);
}

}
