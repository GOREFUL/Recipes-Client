import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthSrvc, Me } from '../../../services/network/auth.service';

@Component({
  selector: 'rcps-header-layout',
  standalone: true,
  templateUrl: 'header.layout.html',
  imports: [CommonModule, RouterModule, MatIconModule],
})
export class HeaderLayout implements OnInit {
  private readonly auth = inject(AuthSrvc);
  private readonly router = inject(Router);

  displayName = 'User';
  photoURL   = '/images/avatar-default.png'; // положи картинку в assets

  ngOnInit(): void {
    // если токен уже есть (после refresh), подтянуть профиль
    this.auth.initMe();

    // подписываемся на профиль с бэка
    this.auth.me$.subscribe((u: Me | null) => {
      this.displayName = u?.displayName || u?.email?.split('@')[0] || 'User';
      const url = (u?.avatarUrl || '').trim();
      this.photoURL = url ? url : '/images/avatar-default.png';
    });
  }

  isLoggedIn(): boolean { return this.auth.isLoggedIn(); }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  onMenuClick(): void {
    const ev = new CustomEvent('menuClick', { bubbles: true });
    document.dispatchEvent(ev);
  }
}
