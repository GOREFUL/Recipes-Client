import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterOutlet } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

import { HeaderLayout } from "../header/header.layout";
import { FooterLayout } from "../footer/footer.layout";
import { SidebarLayout } from "../sidebar/sidebar.layout";

@Component
({
  selector: 'rcps-main-layout',
  templateUrl: 'main.layout.html',
  imports:
  [
    RouterOutlet,
    CommonModule,
    MatIconModule,
    SidebarLayout,
    FooterLayout,
    HeaderLayout
  ]
})
export class MainLayout
{
  public sidebarActive: boolean = false;

  public onSidebarClick(): void
  { this.sidebarActive = !this.sidebarActive; }
}
