/*
 * Files        : register.page.ts, register.page.html
 * Description  : Register page. Gives possibility to register using appropriate data.
 * Author       : Kuts Vladyslav Ivanovich
 */
import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { RouterModule, Router, ActivatedRoute } from '@angular/router';

import { AuthSrvc } from '../../../../services/network/auth.service';

@Component({
  selector: 'rcps-register-page',
  standalone: true,
  templateUrl: 'register.page.html',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
  ],
})
/**
 * Handles register logic of the application
*/
export class RegisterPage {
  private readonly _auth = inject(AuthSrvc);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  /** Бэку требуется displayName */
  public data = {
    displayName: '',
    email: '',
    password: '',
  };

  public loading = false;

  private getReturnUrl(): string {
    return this._route.snapshot.queryParamMap.get('returnUrl') || '/home';
  }

  public onSubmit(): void {
    if (this.loading) return;
    if (!this.data.email || !this.data.password) return;

    const dto = {
      displayName: this.data.displayName?.trim() || this.data.email.split('@')[0],
      email: this.data.email.trim(),
      password: this.data.password,
    };

    this.loading = true;
    this._auth.register(dto).subscribe({
      next: () => {
        this._auth.initMe();
        this.loading = false;
this._router.navigate(['/home']);
      },
      error: (e) => {
        this.loading = false;
        console.error('Register error', e);
        alert(e?.message || 'Register failed');
      },
    });
  }

  /** Google → popup → регистр/логин на бэке (см. реализацию в AuthSrvc) */
  public googleRegister(): void {
    if (this.loading) return;
    this.loading = true;

    this._auth.googleRegister().subscribe({
      next: () => {
        this._auth.initMe();
        this.loading = false;
this._router.navigate(['/home']);
      },
      error: (e) => {
        this.loading = false;
        console.error('Google register error', e);
        alert(e?.message || 'Google sign-in failed');
      },
    });
  }
}
