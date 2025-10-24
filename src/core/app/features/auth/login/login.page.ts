/*
 * Files        : login.page.ts, login.page.html
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

import { RouterModule, Router } from '@angular/router';
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
    RouterModule
  ],
})
/**
 * Handles login logic of the application
*/
export class LoginPage {
  private readonly _authSrvc = inject(AuthSrvc);
  private readonly _router = inject(Router);

  /** Target input model of user credentials */
  public readonly data: Credentials = UtilsFactory.createCredentials();

  public onSubmit(): void {
    this._authSrvc.login(this.data).subscribe({
      next: () => this._router.navigate(['/']),   // редирект после успеха
      error: (e) => console.error('Login error', e),
    });
  }

  /** Google login via Firebase -> exchange on backend */
  public googleLogin(): void {
    this._authSrvc.loginWithGoogle().subscribe({
      next: () => this._router.navigate(['/']),
      error: (e) => console.error('Google login error', e),
    });
  }
}
