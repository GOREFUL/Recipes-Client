import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { DishSrvc } from '../../../../services/network/dish.service';

// ⬇️ добавили: лукапы + rxjs
import { LookupsSrvc, Lookup } from '../../../../services/network/lookups.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

type DishVM = {
  id?: number;
  name: string;
  description?: string;

  images: Array<{ url: string; description?: string }>;

  // ⬇️ добавили опциональные id, чтобы мапить названия из лукапов
  ingredients: Array<{
    name: string;
    measure: string;
    value: number;
    ingredientId?: number;
    measureUnitId?: number;
    measurementUnitId?: number;
  }>;

  cuisines: Array<{ name: string }>;
  allergies: Array<{ name: string }>;

  macronutrients: {
    kcal?: number;
    saturatedFat?: number;
    transFat?: number;
    sugars?: number;
    fiber?: number;
    protein?: number;
    salt?: number;
  };

  cookInfo: {
    time?: string;
    yieldVal?: number;
    servingSize?: number;
    note?: string;
  };
};

@Component({
  selector: 'rcps-dish-details-page',
  standalone: true,
  templateUrl: 'dish-details.page.html',
  imports: [CommonModule, MatIconModule],
})
export class DishDetailsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dishApi = inject(DishSrvc);
  private readonly lookups = inject(LookupsSrvc); // ⬅️

  dish: DishVM | null = null;
  loading = true;

  macronutrientKeys = [
    'kcal',
    'saturatedFat',
    'transFat',
    'sugars',
    'fiber',
    'protein',
    'salt',
  ] as const;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.onBack(); return; }

    this.dishApi.getDetails(id).subscribe({
      next: (raw) => {
        // 1) нормализуем ответ бэка
        const vm = this.normalize(raw);

        // 2) тянем лукапы и подставляем имена по id
        forkJoin({
          units: this.lookups.measureUnits().pipe(catchError(() => of([] as Lookup[]))),
          ingredients: this.lookups.ingredients('', 1, 200).pipe(catchError(() => of([] as Lookup[]))),
        }).subscribe(({ units, ingredients }) => {
          this.dish = this.applyNames(vm, ingredients, units);
          this.loading = false;
        });
      },
      error: () => {
        this.loading = false;
        this.onBack();
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/dishes']);
  }

  /** Подставляем человекочитаемые имена из лукапов по id */
  private applyNames(vm: DishVM, ingrLkp: Lookup[], unitLkp: Lookup[]): DishVM {
    const ingrMap = new Map<number, string>(ingrLkp.map(x => [x.id, x.name]));
    const unitMap = new Map<number, string>(unitLkp.map(x => [x.id, x.name]));

    const ingredients = vm.ingredients.map(i => {
      // ingredient name
      const name =
        i.name && !i.name.startsWith('#')
          ? i.name
          : (i.ingredientId != null ? (ingrMap.get(i.ingredientId) ?? `#${i.ingredientId}`) : i.name);

      // measure name
      const unitId = i.measureUnitId ?? i.measurementUnitId;
      const measure =
        i.measure && !i.measure.startsWith('#')
          ? i.measure
          : (unitId != null ? (unitMap.get(unitId) ?? `#${unitId}`) : i.measure);

      return { ...i, name, measure };
    });

    return { ...vm, ingredients };
  }

  /** Приводим ответ бэка (любой формы) к единому VM для шаблона */
  private normalize(raw: any): DishVM {
    // images: imageUrls (string[]) ИЛИ images [{url|image, description}]
    const images: Array<{ url: string; description?: string }> = Array.isArray(raw?.imageUrls)
      ? raw.imageUrls.filter(Boolean).map((u: string) => ({ url: String(u) }))
      : Array.isArray(raw?.images)
        ? raw.images
            .map((i: any) => i?.url || i?.image)
            .filter(Boolean)
            .map((u: string, i: number) => ({
              url: String(u),
              description: raw.images?.[i]?.description ?? '',
            }))
        : [];

    // cuisines / allergies могут быть строками
    const toNameArray = (arr: any[] | undefined) =>
      (Array.isArray(arr) ? arr : []).map(x =>
        typeof x === 'string' ? { name: x } : { name: x?.name ?? '' }
      ).filter(x => !!x.name);

    const cuisines  = toNameArray(raw?.cuisines);
    const allergies = toNameArray(raw?.allergies);

    // ingredients: учитываем measureUnitId И measurementUnitId(+Name)
    const ingredients = Array.isArray(raw?.ingredients)
      ? raw.ingredients.map((i: any) => {
          const ingredientId =
            typeof i?.ingredientId === 'number' ? i.ingredientId : undefined;

          const measureUnitId =
            typeof i?.measureUnitId === 'number' ? i.measureUnitId : undefined;

          const measurementUnitId =
            typeof i?.measurementUnitId === 'number' ? i.measurementUnitId : undefined;

          return {
            name:
              i?.name ??
              i?.ingredientName ??
              (ingredientId != null ? `#${ingredientId}` : '#'),
            measure:
              i?.measure ??
              i?.measurementUnitName ??
              (measureUnitId != null
                ? `#${measureUnitId}`
                : (measurementUnitId != null ? `#${measurementUnitId}` : '#')),
            value: Number(i?.value ?? 0),
            ingredientId,
            measureUnitId,
            measurementUnitId,
          };
        })
      : [];

    // macros: маппим чужие ключи (calories, satFat, trFat) в наши
    const rawMacros = raw?.macronutrients ?? raw?.macros ?? {};
    const macronutrients: DishVM['macronutrients'] = {
      kcal:          rawMacros.kcal          ?? rawMacros.calories     ?? 0,
      saturatedFat:  rawMacros.saturatedFat  ?? rawMacros.satFat       ?? 0,
      transFat:      rawMacros.transFat      ?? rawMacros.trFat        ?? 0,
      sugars:        rawMacros.sugars        ?? 0,
      fiber:         rawMacros.fiber         ?? 0,
      protein:       rawMacros.protein       ?? 0,
      salt:          rawMacros.salt          ?? 0,
    };

    // cookInfo: либо объект, либо поля на корне
    const cookInfo =
      raw?.cookInfo ?? {
        time:        raw?.time ?? '',
        yieldVal:    raw?.yield ?? raw?.yieldVal ?? undefined,
        servingSize: raw?.servingSize ?? undefined,
        note:        raw?.note ?? '',
      };

    return {
      id: raw?.id,
      name: raw?.name ?? '',
      description: raw?.description ?? '',
      images,
      ingredients,
      cuisines,
      allergies,
      macronutrients,
      cookInfo,
    };
  }
}
