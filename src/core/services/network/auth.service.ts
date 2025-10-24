/*
 * File        : auth.service.ts
 * Description : Authorization Main Service
 * Author      : Kuts Vladyslav Ivanovich
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap, tap } from 'rxjs';

import { Credentials } from '../../utils/credentials.util';
import { AuthResponse } from '../../utils/auth-response.util';
import { environment } from '../../../environments/environment.dev';

// 👇 Firebase Auth
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthSrvc {
  private readonly _baseUrl = `${environment.apiUrl}/auth`;

  private readonly _httpClient = inject(HttpClient);
  private readonly _auth = inject(Auth); // Firebase
  public get token(): string | null { return localStorage.getItem('token'); }

  public login(credentials: Credentials): Observable<AuthResponse> {
    return this._httpClient.post<AuthResponse>(`${this._baseUrl}/login`, credentials).pipe(
      tap(res => localStorage.setItem('token', res.token))
    );
  }

  public register(credentials: Credentials): Observable<AuthResponse> {
    return this._httpClient.post<AuthResponse>(`${this._baseUrl}/register`, credentials).pipe(
      tap(res => localStorage.setItem('token', res.token))
    );
  }

  /** Google -> берём ID токен у Firebase -> шлём на бэк для обмена на ваш JWT */
  public loginWithGoogle(): Observable<AuthResponse> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this._auth, provider)).pipe(
      switchMap(async cred => {
        const idToken = await cred.user.getIdToken(); // гугловский ID токен (JWT)
        return this._httpClient.post<AuthResponse>(`${this._baseUrl}/google`, { idToken }).toPromise();
      }),
      // toPromise вернёт Promise<AuthResponse>, вернём это обратно как Observable
      switchMap(res => from(Promise.resolve(res as AuthResponse))),
      tap(res => localStorage.setItem('token', res.token))
    );
  }

  public logout(): void {
    localStorage.removeItem('token');
  }

  public isLoggedIn(): boolean {
    // твой вариант был баговый: null != '' даёт true.
    const t = localStorage.getItem('token');
    return !!t && t.length > 0;
  }
  public registerWithGoogle() { 
  return this.loginWithGoogle();
}
}
