// src/core/app/app.routes.ts
import { Routes } from '@angular/router';

import { LoginPage } from './features/auth/login/login.page';
import { RegisterPage } from './features/auth/register/register.page';

import { HomePage } from './features/home/home.page';
import { DishesPage } from './features/dish/dishes/dishes.page';
import { PostsPage } from './features/all-posts/posts.page';
import { SubscriptionComponent } from './features/subscription/subscription.page';
import { MealPlannerPage } from './features/meal-planner/meal-planner.page';
import { RecipeAiPage } from './features/recipe-ai/recipe-ai.page';
import { UserStatsPage } from './features/user-stats/user-stats.page';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },

  // публичные страницы
  { path: 'home', component: HomePage },
  { path: 'dishes', component: DishesPage },
  { path: 'planner', component: MealPlannerPage },
  { path: 'ai', component: RecipeAiPage },
  { path: 'stats', component: UserStatsPage },

  {
    path: 'home',
    component: HomePage,
  },
  
  {
    path: 'dishes',
    component: DishesPage
  },

  {
    path: 'posts',
    component: PostsPage,
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
    path: 'subscription',
    component: SubscriptionComponent,
  },

  {
    path: '**',
    redirectTo: 'home',
  }
];
