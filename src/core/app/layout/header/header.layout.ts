import { Component, EventEmitter, Output, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Auth } from '@angular/fire/auth';
import { AuthSrvc } from '../../../services/network/auth.service';

@Component({
  selector: 'rcps-header-layout',
  standalone: true,
  templateUrl: 'header.layout.html',
  imports: [CommonModule, RouterModule, MatIconModule],
})
export class HeaderLayout {
  @Output() menuClick = new EventEmitter<void>();

  private firebase = inject(Auth);
  public auth = inject(AuthSrvc);

  onMenuClick() { this.menuClick.emit(); }
  get displayName() {
    return this.firebase.currentUser?.displayName || this.firebase.currentUser?.email || 'User';
  }
  get photoURL() { return this.firebase.currentUser?.photoURL ?? null; }
  logout() { this.auth.logout(); }
}
