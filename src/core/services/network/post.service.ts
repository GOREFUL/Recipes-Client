// src/core/app/services/network/post.service.ts
/*
 * Post Service – список моих постов, CRUD.
 */
import { Injectable, inject, signal, WritableSignal, Signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment.dev';

export interface Post {
  id: number;
  userId?: string;
  dishId: number;
  name: string;              // заголовок
  description?: string;
  mediaUrl: string;          // ссылка на картинку/видео
  createdAt?: string;        // ISO
  likes?: number;
  dislikes?: number;
}

export interface PostDto {
  name: string;
  description?: string;
  dishId: number;
  mediaUrl: string;
}
// Быстрый декодер JWT из localStorage
function getJwt(): string | null {
  // подставил самые частые ключи; если у тебя другой — добавь
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('id_token')
  );
}
function parseJwt<T = any>(jwt: string | null): T | null {
  if (!jwt) return null;
  const parts = jwt.split('.');
  if (parts.length < 2) return null;
  try {
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function extractUserIdFromJwt(): string | null {
  const payload = parseJwt<any>(getJwt());
  if (!payload) return null;
  // ASP.NET часто кладёт сюда:
  return (
    payload.sub ||
    payload.nameid ||
    payload.userId ||
    payload.uid ||
    payload.sid ||
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
    null
  );
}
type CountPayload = { likes?: number; dislikes?: number };

// попытка распарсить text/plain -> {likes,dislikes}
function parseCounts(t: string): CountPayload {
  try {
    const j = JSON.parse(t);
    return { likes: Number(j.likes ?? 0), dislikes: Number(j.dislikes ?? 0) };
  } catch {
    // text/plain типа: {"likes": 0, "dislikes": 0}
    const mLikes = t.match(/"likes"\s*:\s*(\d+)/i);
    const mDis   = t.match(/"dislikes"\s*:\s*(\d+)/i);
    return {
      likes: Number(mLikes?.[1] ?? 0),
      dislikes: Number(mDis?.[1] ?? 0),
    };
  }
}

@Injectable({ providedIn: 'root' })
export class PostSrvc {
  private http = inject(HttpClient);
  // В Swagger у тебя `Posts` с заглавной
  private base = `${environment.apiUrl}/Posts`;

  private _posts: WritableSignal<Post[]> = signal<Post[]>([]);
  public posts(): Post[] { return this._posts(); }
  public postsReadonly(): Signal<Post[]> { return this._posts.asReadonly(); }
  /** fresh-посты для домашки */
  private _fresh: WritableSignal<Post[]> = signal<Post[]>([]);
  public freshPosts(): Post[] { return this._fresh(); }
  public freshReadonly(): Signal<Post[]> { return this._fresh.asReadonly(); }
  /**
   * Грузим посты текущего пользователя:
   * GET /api/Posts/by-user/{userId}?page=1&pageSize=20
   */
  loadMine(page = 1, pageSize = 20): void {
    const userId = extractUserIdFromJwt();
    if (!userId) {
      console.warn('No userId in JWT → posts list cleared');
      this._posts.set([]);
      return;
    }

    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    this.http.get<Post[] | { items: Post[] }>(`${this.base}/by-user/${userId}`, { params })
      .subscribe({
        next: (res) => {
          const arr = Array.isArray(res) ? res : (res?.items ?? []);
          this._posts.set(arr ?? []);
        },
        error: (e) => {
          console.warn('Posts loadMine error:', e);
          this._posts.set([]);
        },
      });
  }

  /** Если понадобится общий GET — оставляю, но не используем (бэк даёт 405) */
  loadAllRaw(): void {
    this.http.get<Post[] | { items: Post[] }>(this.base).subscribe({
      next: (res) => {
        const arr = Array.isArray(res) ? res : (res?.items ?? []);
        this._posts.set(arr ?? []);
      },
      error: () => this._posts.set([]),
    });
  }
  /** Загрузить свежие посты (sinceUtc, page, pageSize — опционально) */
  loadFresh(opts?: { sinceUtc?: string; page?: number; pageSize?: number }): void {
    let params = new HttpParams();
    if (opts?.sinceUtc)  params = params.set('sinceUtc', opts.sinceUtc);
    if (opts?.page)      params = params.set('page', String(opts.page));
    if (opts?.pageSize)  params = params.set('pageSize', String(opts.pageSize));

    this.http.get<Post[] | { items: Post[] }>(`${this.base}/fresh`, { params }).subscribe({
      next: (res) => this._fresh.set(Array.isArray(res) ? res : (res?.items ?? [])),
      error: () => this._fresh.set([]),
    });
  }
  /** POST /api/Posts — бэк может вернуть text/plain с id */
  create(dto: PostDto): Observable<number | Post> {
    // МАППИНГ mediaUrl -> url
    const payload = {
      name: dto.name,
      description: dto.description ?? '',
      dishId: dto.dishId,
      url: dto.mediaUrl,                 // <-- ВАЖНО
    };

    return this.http.post(`${this.base}`, payload, { responseType: 'text' as const })
      .pipe(map(t => (Number.isFinite(Number(t)) ? Number(t) : (t as unknown as Post))));
  }


  update(post: Post): Observable<Post> {
    const payload = {
      id: post.id,
      name: post.name,
      description: post.description ?? '',
      dishId: post.dishId,
      url: post.mediaUrl,                // <-- ВАЖНО
    };
    return this.http.put<Post>(`${this.base}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.base}/${id}`);
  }

    /** PUT /api/Posts/{postId}/likes?delta=±1 -> {likes,dislikes} (может прийти как text/plain) */
  changeLikes(postId: number, delta = 1): Observable<CountPayload> {
    const url = `${this.base}/${postId}/likes?delta=${delta}`;
    return this.http.put(url, null, { responseType: 'text' }).pipe(
      map(parseCounts),
      catchError(() => of({} as CountPayload))
    );
  }

  /** PUT /api/Posts/{postId}/dislikes?delta=±1 -> {likes,dislikes} (может прийти как text/plain) */
  changeDislikes(postId: number, delta = 1): Observable<CountPayload> {
    const url = `${this.base}/${postId}/dislikes?delta=${delta}`;
    return this.http.put(url, null, { responseType: 'text' }).pipe(
      map(parseCounts),
      catchError(() => of({} as CountPayload))
    );
  }
  // Заглушки — пока не реализовано на бэке
  like(id: number)    { return this.changeLikes(id, +1); }
  unlike(id: number)  { return this.changeLikes(id, -1); }
  dislike(id: number) { return this.changeDislikes(id, +1); }
  undislike(id: number) { return this.changeDislikes(id, -1); }
}
