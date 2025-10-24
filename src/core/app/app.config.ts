import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../services/network/auth.interceptor';

import { CommentSrvc } from '../services/network/comment.service';
import { DishSrvc } from '../services/network/dish.service';
import { PostSrvc } from '../services/network/post.service';
import { AuthSrvc } from '../services/network/auth.service';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from '../../environments/environment.dev';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // ВАЖНО: чтобы заработали DI-интерцепторы
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),

    // Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),

    // Сервисы
    CommentSrvc,
    DishSrvc,
    PostSrvc,
    AuthSrvc,

    // Интерцептор твоего токена
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
};
