import { Component } from '@angular/core';

import { MainLayout } from './layout/main-layout/main.layout';

@Component
({
  selector: 'rcps-root',
  templateUrl: 'app.component.html',
  imports:
  [
    MainLayout
  ]
})
export class AppComponent 
{ }
