import { Routes } from '@angular/router';
import { LoginPage } from './features/auth/login/login.page';
import { HomePage } from './features/home/home.page';
import { RegisterPage } from './features/auth/register/register.page';
import { UserStatsPage } from './features/user-stats/user-stats.page';
import { RecipeAiPage } from './features/recipe-ai/recipe-ai.page';
import { MealPlannerPage } from './features/meal-planner/meal-planner.page';
import { DishesPage } from './features/dish/dishes/dishes.page';

export const routes: Routes =
[
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: 'login',
    component: LoginPage,
  },

  {
    path: 'register',
    component: RegisterPage,
  },

  {
    path: 'home',
    component: HomePage,
  },
  
  {
    path: 'dishes',
    component: DishesPage
  },

  {
    path: 'planner',
    component: MealPlannerPage
  },

  {
    path: 'ai',
    component: RecipeAiPage,
  },

  {
    path: 'stats',
    component: UserStatsPage,
  },

  {
    path: '**',
    redirectTo: 'home',
  }
];