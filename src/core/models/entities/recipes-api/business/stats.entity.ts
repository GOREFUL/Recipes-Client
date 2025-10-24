export type StatsPeriod = '7d' | '30d';

export interface DailyEntry {
  date: string;      // YYYY-MM-DD
  calories: number;  // ккал за день
  protein: number;   // грамм
  carbs: number;     // грамм
  fat: number;       // грамм
  cookedMeals: number; // сколько раз готовил(а) в день
}

export interface StatsResponse {
  period: StatsPeriod;
  entries: DailyEntry[];
}