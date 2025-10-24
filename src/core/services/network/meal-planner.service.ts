import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type IsoDate = string; // YYYY-MM-DD
export type MealPlanMap = Record<IsoDate, string[]>;

@Injectable({ providedIn: 'root' })
export class MealPlannerService {
  // В проде заменим на реальные API вызовы c userId
  private key(userId: string) { return `meal-planner:${userId}`; }

  private read(userId: string): MealPlanMap {
    try {
      const raw = localStorage.getItem(this.key(userId));
      return raw ? JSON.parse(raw) as MealPlanMap : {};
    } catch {
      return {};
    }
  }

  private write(userId: string, map: MealPlanMap) {
    localStorage.setItem(this.key(userId), JSON.stringify(map));
  }

  getPlans(userId: string, from: Date, to: Date): Observable<MealPlanMap> {
    const map = this.read(userId);
    // при желании можно отфильтровать по диапазону; пока отдадим всё
    return of(map);
    // TODO: позже заменить на this.http.get(...)
  }

  addDish(userId: string, date: IsoDate, dishName: string): Observable<MealPlanMap> {
    const map = this.read(userId);
    if (!map[date]) map[date] = [];
    map[date].push(dishName);
    this.write(userId, map);
    return of(map);
  }

  removeDish(userId: string, date: IsoDate, index: number): Observable<MealPlanMap> {
    const map = this.read(userId);
    if (map[date]) {
      map[date].splice(index, 1);
      if (!map[date].length) delete map[date];
      this.write(userId, map);
    }
    return of(map);
  }
}
