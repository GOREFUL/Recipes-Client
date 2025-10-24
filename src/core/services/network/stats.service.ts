import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DailyEntry, StatsPeriod, StatsResponse } from '../../models/entities/recipes-api/business/stats.entity';

//Генерация простых данных
@Injectable({ providedIn: 'root' })
export class StatsService {

  getStats(period: StatsPeriod = '7d'): Observable<StatsResponse> {
    const days = period === '7d' ? 7 : 30;
    const today = new Date();

    const entries: DailyEntry[] = Array.from({ length: days }).map((_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - idx));
      const cookedMeals = this.randInt(0, 3);
      const protein = this.randInt(60, 140);
      const carbs   = this.randInt(160, 320);
      const fat     = this.randInt(40, 90);
      const calories = Math.round(protein * 4 + carbs * 4 + fat * 9 + this.randInt(-120, 120));

      return {
        date: d.toISOString().slice(0, 10),
        calories,
        protein,
        carbs,
        fat,
        cookedMeals
      };
    });

    const payload: StatsResponse = { period, entries };
    return of(payload).pipe(delay(300)); // задержка
  }

  private randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
