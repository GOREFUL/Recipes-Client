// src/core/app/services/network/auth.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, throwError, tap, from, concatMap} from 'rxjs';

import { environment } from '../../../environments/environment.dev';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { UserCredential } from 'firebase/auth';

// ---- DTO/Types ----
export interface Credentials { email: string; password: string; }
export interface RegisterDto  { email: string; password: string; displayName: string; }
export interface AuthResponse { token?: string; accessToken?: string; jwt?: string; user?: any; }
export interface Me {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  createAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthSrvc {
  private http   = inject(HttpClient);
  private afAuth = inject(Auth);
  private readonly tokenKey = 'access_token';

  private base = `${environment.apiUrl}/identity`;

  private _me$ = new BehaviorSubject<Me | null>(null);
  public  me$  = this._me$.asObservable();

  // ---------- helpers ----------
private setTokenFromResponse(res: HttpResponse<any> | { [k: string]: any } | null) {
  if (!res) return;

  // 1) Тело ответа
  const body: any = (res as any).body ?? res;

  // Популярные имена полей
  const direct =
    body?.token ||
    body?.accessToken ||
    body?.jwt ||
    body?.access_token ||
    body?.bearer ||
    null;

  // 2) Заголовок Authorization: Bearer xxx
  const authHeader =
    res instanceof HttpResponse ? res.headers.get('Authorization') : null;
  const fromHeader = authHeader?.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7)
    : null;

  // 3) Поиск JWT «в глубину» (иногда кладут в вложенные объекты)
  const fromDeep = (() => {
    const looksLikeJwt = (v: any) =>
      typeof v === 'string' && v.split('.').length === 3 && v.length > 20;
    const walk = (o: any): string | null => {
      if (!o || typeof o !== 'object') return null;
      for (const k of Object.keys(o)) {
        const v = o[k];
        if (looksLikeJwt(v)) return v;
        if (v && typeof v === 'object') {
          const nested = walk(v);
          if (nested) return nested;
        }
      }
      return null;
    };
    return walk(body);
  })();

  const token = direct || fromHeader || fromDeep;

  // DEBUG: посмотреть реальный ответ и где нашли токен
  // УДАЛИ после проверки
  // eslint-disable-next-line no-console
  console.log('[Auth] login/register response:', { body, authHeader, token });

  if (token) {
    localStorage.setItem('token', token);
  }
}


  // всегда шлём withCredentials на /api — если бек использует auth-cookie
  private withCred<T>(obs: Observable<T>): Observable<T> { return obs; }
  // (ниже в конкретных вызовах добавлю withCredentials: true)

  public initMe(): void {
    // если токен есть или вдруг бек живёт на cookie — пробуем подтянуть профиль
    const hasToken = !!localStorage.getItem('token');
    if (!hasToken) {
      // всё равно попробуем — вдруг cookie
      this.me<Me>().subscribe({
        next: (u) => this._me$.next(u),
        error: () => this._me$.next(null),
      });
      return;
    }
    this.me<Me>().subscribe({
      next: (u) => this._me$.next(u),
      error: () => this._me$.next(null),
    });
  }

  public isLoggedIn(): boolean {
    return !!this._me$.value || !!localStorage.getItem('token');
  }

  public logout(): void {
    localStorage.removeItem('token');
    this._me$.next(null);
  }

  // ---------- API ----------
  public login(dto: Credentials): Observable<Me> {
    return this.http.post<AuthResponse>(`${this.base}/login`, dto, {
      withCredentials: true, observe: 'response'
    }).pipe(
      tap((res) => this.setTokenFromResponse(res)),
      switchMap(() => this.http.get<Me>(`${this.base}/me`, { withCredentials: true })),
      tap((me) => this._me$.next(me)),
      catchError((e: HttpErrorResponse) =>
        throwError(() => new Error((e.error?.title || e.error?.message) ?? 'Login failed')))
    );
  }

public register(dto: RegisterDto): Observable<Me | null> {
  const body: RegisterDto = {
    ...dto,
    displayName: (dto.displayName?.trim() || dto.email.split('@')[0]),
  };

  // 1) Регистрируем
  return this.http.post<AuthResponse>(`${this.base}/register`, body, {
    withCredentials: true, observe: 'response'
  }).pipe(
    tap(res => this.setTokenFromResponse(res)),

    // 2) ВСЕГДА пробуем авто-логин (многие бэки не выдают токен на /register)
    concatMap(() =>
      this.http.post<AuthResponse>(`${this.base}/login`, {
        email: dto.email, password: dto.password
      }, { withCredentials: true, observe: 'response' })
      .pipe(tap(res => this.setTokenFromResponse(res)))
    ),

    // 3) Тянем профиль (если токен/кука есть — будет 200; иначе 401)
    switchMap(() =>
      this.http.get<Me>(`${this.base}/me`, { withCredentials: true })
        .pipe(
          tap(me => this._me$.next(me)),
          catchError(() => of(null)) // если 401 — вернём null, но не падём
        )
    ),

    // Ошибки только по самой регистрации (конфликты и т.п.)
    catchError((e) => {
      const msg = (e.error?.title || e.error?.message || 'Register failed');
      return throwError(() => new Error(msg));
    })
  );
}


  public me<T = any>(): Observable<T> {
    return this.http.get<T>(`${this.base}/me`, { withCredentials: true });
  }

  // ---------- Google ----------
// было: Observable<Me>
public googleLogin(): Observable<Me | null> {
  const provider = new GoogleAuthProvider();
  const popupPromise = signInWithPopup(this.afAuth, provider) as Promise<UserCredential>;

  return from(popupPromise).pipe(
    switchMap((cred: UserCredential) => {
      const email = cred.user.email ?? '';
      if (!email) return throwError(() => new Error('Google account has no email.'));

      const displayName = (cred.user.displayName ?? email.split('@')[0]).trim();
      const password = `GGL_${cred.user.uid}_#S1`;

      // Регистрируем или логиним на нашем бэке
      return this.registerOrLogin(email, password, displayName);
    }),
    catchError(() => of(null))
  );
}

// Обнови registerOrLogin чтобы возвращал Me | null, как раньше писал:
private registerOrLogin(email: string, password: string, displayName: string): Observable<Me | null> {
  return this.http.post<AuthResponse>(`${this.base}/register`, { email, password, displayName }, {
    withCredentials: true, observe: 'response'
  }).pipe(
    tap(res => this.setTokenFromResponse(res)),
    catchError((err) => {
      if (err.status === 400 || err.status === 409) {
        return this.http.post<AuthResponse>(`${this.base}/login`, { email, password }, {
          withCredentials: true, observe: 'response'
        }).pipe(tap(res => this.setTokenFromResponse(res)));
      }
      return throwError(() => err);
    }),
    switchMap(() =>
      this.http.get<Me>(`${this.base}/me`, { withCredentials: true })
        .pipe(
          tap(me => this._me$.next(me)),
          catchError(() => of(null))
        )
    )
  );
}


public googleRegister(): Observable<Me | null> {
  return this.googleLogin();
}
 getAccessToken(): string | null {
    try { return localStorage.getItem(this.tokenKey); } catch { return null; }
  }
   getUserId(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) return null;

    try {
      const payload = JSON.parse(atob(parts[1]));
      const id =
        payload?.nameid ?? payload?.sub ?? payload?.uid ?? payload?.userId ?? null;
      return typeof id === 'string' ? id : (id != null ? String(id) : null);
    } catch {
      return null;
    }
  }

}
