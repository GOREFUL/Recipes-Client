import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MealPlannerService, MealPlanMap } from '../../../services/network/meal-planner.service';

type IsoDate = string;

@Component({
  selector: 'app-meal-planner',
  standalone: true,                 // ← добавили
  imports: [CommonModule, FormsModule], // ← добавили
  templateUrl: './meal-planner.page.html'
})
export class MealPlannerPage implements OnInit {
  userId = 'demo-user'; // TODO: заменить на реального юзера, когда появится auth
  monthCursor = new Date(); // текущий месяц
  days: { date: IsoDate; inMonth: boolean }[] = [];

  plans: MealPlanMap = {};        // { '2025-08-24': ['Dish A', 'Dish B'] }
  selectedDate: IsoDate = this.toIsoDate(new Date());
  newDish = '';

  loading = false;

  constructor(private mealPlanner: MealPlannerService) {}

  ngOnInit(): void {
    this.rebuildMonth();
    this.loadMonthPlans();
  }

  // ---------- UI helpers ----------
  toIsoDate(d: Date): IsoDate {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  sameDay(a: IsoDate, b: IsoDate) { return a === b; }
  isToday(iso: IsoDate) { return iso === this.toIsoDate(new Date()); }

  // ---------- calendar ----------
  rebuildMonth() {
    const y = this.monthCursor.getFullYear();
    const m = this.monthCursor.getMonth(); // 0..11

    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);

    // начинаем с понедельника
    const start = new Date(first);
    const startDay = (first.getDay() + 6) % 7; // 0=Mon..6=Sun
    start.setDate(first.getDate() - startDay);

    // заканчиваем воскресеньем
    const end = new Date(last);
    const endDay = (last.getDay() + 6) % 7;
    end.setDate(last.getDate() + (6 - endDay));

    const out: { date: IsoDate; inMonth: boolean }[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      out.push({ date: this.toIsoDate(cur), inMonth: cur.getMonth() === m });
      cur.setDate(cur.getDate() + 1);
    }
    this.days = out;
    // если выбранная дата не в месяце — выставим на 1-е
    const selDate = new Date(this.selectedDate);
    if (selDate.getMonth() !== m || selDate.getFullYear() !== y) {
      this.selectedDate = this.toIsoDate(first);
    }
  }

  prevMonth() { this.monthCursor = new Date(this.monthCursor.getFullYear(), this.monthCursor.getMonth() - 1, 1); this.rebuildMonth(); this.loadMonthPlans(); }
  nextMonth() { this.monthCursor = new Date(this.monthCursor.getFullYear(), this.monthCursor.getMonth() + 1, 1); this.rebuildMonth(); this.loadMonthPlans(); }

  // ---------- data ----------
  loadMonthPlans() {
    this.loading = true;
    const y = this.monthCursor.getFullYear();
    const m = this.monthCursor.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    this.mealPlanner.getPlans(this.userId, first, last).subscribe(map => {
      this.plans = map || {};
      this.loading = false;
    });
  }

  dayDishes(date: IsoDate): string[] {
    return this.plans[date] ?? [];
  }

  addDish() {
    const trimmed = this.newDish.trim();
    if (!trimmed) return;
    // только сегодня и будущее
    if (new Date(this.selectedDate) < new Date(this.toIsoDate(new Date()))) return;

    this.mealPlanner.addDish(this.userId, this.selectedDate, trimmed).subscribe(map => {
      this.plans = map;
      this.newDish = '';
    });
  }

  removeDish(date: IsoDate, index: number) {
    this.mealPlanner.removeDish(this.userId, date, index).subscribe(map => {
      this.plans = map;
    });
  }

  selectDay(d: IsoDate) {
    this.selectedDate = d;
  }

  monthLabel(): string {
    return this.monthCursor.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }
}
