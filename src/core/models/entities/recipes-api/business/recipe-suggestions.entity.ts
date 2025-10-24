/*
 * File        : recipe-suggestions.entity.ts
 * Description : Entities for AI Recipe Generator result
 * Author      : [Твоё имя]
 * Version     : 1.0.0
 */

export interface RecipeIngredient
{
  name: string;          // "Tomato"
  amount?: string;       // "2 pcs", "150 g" — строкой, чтобы не падать на единицах измерения
}

export interface RecipeStep
{
  index: number;         // порядковый номер шага (1,2,3...)
  text: string;          // описание шага
  durationMin?: number;  // опционально, если бэк пришлёт
}

export interface Recipe
{
  title?: string;                     // иногда ИИ может дать название
  description: string;                // общее описание блюда
  ingredients: RecipeIngredient[];    // список ингредиентов
  steps: RecipeStep[];                // шаги приготовления
}

/** Ответ API генератора */
export interface RecipeSuggestionsResponse
{
  recipes: Recipe[];      // обычно массив рецептов
  warnings?: string[];    // необязательные предупреждения от бэка/модели
}
