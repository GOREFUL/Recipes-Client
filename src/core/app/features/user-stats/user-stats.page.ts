import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../../services/network/stats.service';
import { DailyEntry, StatsPeriod, StatsResponse } from '../../../models/entities/recipes-api/business/stats.entity';

@Component({
  selector: 'app-user-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-stats.page.html'
})
export class UserStatsPage implements OnInit {
  // состояние
  period = signal<StatsPeriod>('7d');
  entries = signal<DailyEntry[]>([]);
  loading = signal<boolean>(false);

  // агрегаты
  totalCalories = computed(() => this.entries().reduce((s, e) => s + e.calories, 0));
  avgCalories   = computed(() => this.entries().length ? Math.round(this.totalCalories() / this.entries().length) : 0);

  totalProtein  = computed(() => this.entries().reduce((s, e) => s + e.protein, 0));
  totalCarbs    = computed(() => this.entries().reduce((s, e) => s + e.carbs, 0));
  totalFat      = computed(() => this.entries().reduce((s, e) => s + e.fat, 0));

  totalMeals    = computed(() => this.entries().reduce((s, e) => s + e.cookedMeals, 0));

  // проценты макро
  macroPercents = computed(() => {
    const p = this.totalProtein();
    const c = this.totalCarbs();
    const f = this.totalFat();
    const sum = p + c + f;
    if (!sum) return { p: 0, c: 0, f: 0 };
    return {
      p: +(p / sum * 100).toFixed(1),
      c: +(c / sum * 100).toFixed(1),
      f: +(f / sum * 100).toFixed(1),
    };
  });

  // 👉 упрощение для шаблона: используем отдельные computed,
  //   чтобы не вызывать функции внутри микросинтаксиса
  macro = computed(() => this.macroPercents()); // { p,c,f }

  caloriesPath = computed(() => this.buildCaloriesPath(this.entries()));

  // Сегменты пончика вынесены в TS (чтобы не считать в шаблоне)
  donutProtein = computed(() => this.donutStroke(0, this.macro().p));
  donutCarbs   = computed(() => this.donutStroke(this.macro().p, this.macro().c));
  donutFat     = computed(() => this.donutStroke(this.macro().p + this.macro().c, this.macro().f));

  constructor(private stats: StatsService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.stats.getStats(this.period()).subscribe((res: StatsResponse) => {
      this.entries.set(res.entries);
      this.loading.set(false);
    });
  }

  setPeriod(p: StatsPeriod): void {
    if (p !== this.period()) {
      this.period.set(p);
      this.load();
    }
  }

  // --- helpers ---
  private buildCaloriesPath(data: DailyEntry[]): string {
    if (!data.length) return '';
    const w = 320, h = 120, pad = 20;
    const xs = data.map((_, i) => pad + (i * (w - 2 * pad)) / (data.length - 1 || 1));
    const ysRaw = data.map(d => d.calories);

    const minY = Math.min(...ysRaw);
    const maxY = Math.max(...ysRaw);
    const range = Math.max(1, maxY - minY);

    const ys = ysRaw.map(v => {
      const t = (v - minY) / range;      // 0..1
      return pad + (1 - t) * (h - 2 * pad); // инверсия для SVG
    });

    return xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  }

  donutStroke(totalPercentBefore: number, thisPercent: number, radius = 54): { dasharray: string; dashoffset: number } {
    const C = 2 * Math.PI * radius;
    const len = (thisPercent / 100) * C;
    const gap = C - len;
    const offset = - (totalPercentBefore / 100) * C;
    return { dasharray: `${len} ${gap}`, dashoffset: offset };
  }
}
