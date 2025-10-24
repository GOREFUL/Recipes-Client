import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  RecipeSuggestionsResponse,
  Recipe
} from '../../models/entities/recipes-api/business/recipe-suggestions.entity';

@Injectable({
  providedIn: 'root'
})
export class RecipeAiService {
  constructor(private http: HttpClient) {}

  /** ingredients — a string from the textarea (e.g., "eggs, cheese, mushrooms") */
  getSuggestions(ingredients: string): Observable<RecipeSuggestionsResponse> {
    // mocked for the NEW model
    const mock: RecipeSuggestionsResponse = {
      recipes: [
        {
          title: 'Omelette with Cheese and Mushrooms',
          description: 'A fluffy skillet omelette with grated cheese and mushrooms.',
          ingredients: [
            { name: 'eggs', amount: '3 pcs' },
            { name: 'cheese', amount: '50 g' },
            { name: 'mushrooms', amount: '100 g' },
            { name: 'butter/oil', amount: '1 tbsp' },
            { name: 'salt', amount: 'to taste' }
          ],
          steps: [
            { index: 1, text: 'Slice the mushrooms and sauté in oil for 3–4 minutes.' },
            { index: 2, text: 'Beat the eggs with salt and add the grated cheese.' },
            { index: 3, text: 'Pour the mixture into the pan with the mushrooms and cook until set.' }
          ]
        }
      ]
    };

    return of(mock);

    // real request (typed!)
    // const payload = {
    //   ingredients: ingredients.split(',').map(x => x.trim()).filter(Boolean)
    // };
    // return this.http.post<RecipeSuggestionsResponse>(
    //   '/api/recipes/generate',
    //   payload
    // );
  }
}
