// src/core/app/services/network/lookups.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.dev';
import { Observable, map } from 'rxjs';

export interface Lookup { id: number; name: string; }
export interface Paged<T> { items: T[]; page: number; pageSize: number; total: number; }

@Injectable({ providedIn: 'root' })
export class LookupsSrvc {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/lookups`;

  /** Возвращаем всегда массив: либо сам ответ — массив, либо ответ.items */
  private asArray<T>() {
    return map((x: any) => Array.isArray(x) ? (x as T[]) : ((x?.items as T[]) ?? []));
  }

  ingredients(q = '', page = 1, pageSize = 200): Observable<Lookup[]> {
    const params = new HttpParams().set('q', q).set('page', page).set('pageSize', pageSize);
    return this.http
      .get<Paged<Lookup> | Lookup[]>(`${this.base}/ingredients`, { params })
      .pipe(this.asArray<Lookup>());
  }

  measureUnits(): Observable<Lookup[]> {
    return this.http.get<Paged<Lookup> | Lookup[]>(`${this.base}/measure-units`).pipe(this.asArray<Lookup>());
  }
  levels(): Observable<Lookup[]> {
    return this.http.get<Paged<Lookup> | Lookup[]>(`${this.base}/levels`).pipe(this.asArray<Lookup>());
  }
  allergies(): Observable<Lookup[]> {
    return this.http.get<Paged<Lookup> | Lookup[]>(`${this.base}/allergies`).pipe(this.asArray<Lookup>());
  }
  cuisines(): Observable<Lookup[]> {
    return this.http.get<Paged<Lookup> | Lookup[]>(`${this.base}/cuisines`).pipe(this.asArray<Lookup>());
  }
}
