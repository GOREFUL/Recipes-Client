/*
 * Files        : login.page.ts
 * Description  : Login page. Gives possibility to authorize using credentials.
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
import { Credentials } from '../../../../utils/credentials.util';

import { UtilsFactory } from '../../../../factories/utils.factory';
import { AuthSrvc } from '../../../../services/network/auth.service';

@Component({
  selector: 'rcps-login-page',
  templateUrl: 'login.page.html',
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
 * Handles login logic of the application
*/
export class LoginPage {
  private readonly _auth = inject(AuthSrvc);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  /** Target input model of user credentials */
  public readonly data: Credentials = UtilsFactory.createCredentials();
  public loading = false;

  private getReturnUrl(): string {
    return this._route.snapshot.queryParamMap.get('returnUrl') || '/home';
  }

  public onSubmit(): void {
    if (this.loading) return;
    this.loading = true;

    this._auth.login(this.data).subscribe({
      next: () => {
        this._auth.initMe();
        this.loading = false;
        
this._router.navigate(['/home']);
      },
      error: (e) => {
        this.loading = false;
        console.error('Login error', e);
        alert(e?.message || 'Login failed');
      },
    });
  }

  /** Google login via Firebase -> register/login on backend */
  public googleLogin(): void {
    if (this.loading) return;
    this.loading = true;

    this._auth.googleLogin().subscribe({
      next: () => {
        this._auth.initMe();
        this.loading = false;
this._router.navigate(['/home']);
      },
      error: (e) => {
        this.loading = false;
        console.error('Google login error', e);
        alert(e?.message || 'Google sign-in failed');
      },
    });
  }
}
