/*
 * File        : jwt.interceptor.ts
 * Description : JWT interceptor. Used to intercept requests to add JWT token.
 * Author      : Kuts Vladyslav Ivanovich
 */

import { inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class JwtInterceptor implements HttpInterceptor
{
  private readonly _router: Router = inject(Router)

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
  {
    const token = localStorage.getItem('jwt_token');

    let authReq: HttpRequest<any> = req;

    if (token)
    {
      authReq = req.clone
      ({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(authReq).pipe
    (
      catchError(err =>
      {
        if (err.status === 401)
        {
          localStorage.removeItem('jwt_token');
          
          this._router.navigate(['/login']);
        }

        return throwError(() => err);
      })
    );
  }
}