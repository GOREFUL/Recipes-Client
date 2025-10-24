import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeAiService } from '../../../services/network/recipe-ai.service';
import { Recipe, RecipeSuggestionsResponse } from  '../../../models/entities/recipes-api/business/recipe-suggestions.entity';

@Component({
  selector: 'app-recipe-ai',
  templateUrl: './recipe-ai.page.html',
  imports: [CommonModule, FormsModule]
})
export class RecipeAiPage {
  ingredients = '';
  suggestions: Recipe[] = [];
  loading = false;
  errorMsg = '';

  constructor(private recipeAiService: RecipeAiService) {}

  generateRecipes(): void {
    if (!this.ingredients.trim()) {
      this.errorMsg = 'Enter ingredients separated by commas.';
      return;
    }
    this.errorMsg = '';
    this.loading = true;

    this.recipeAiService.getSuggestions(this.ingredients).subscribe({
      next: (data: RecipeSuggestionsResponse) => {
        this.suggestions = data?.recipes ?? [];
        this.loading = false;
      },
      error: () => {
        this.suggestions = [];
        this.errorMsg = 'Failed to generate recipes. Please try again.';
        this.loading = false;
      }
    });
  }

  // optional: clear/reset
  clear() {
    this.ingredients = '';
    this.suggestions = [];
    this.errorMsg = '';
  }
}
