import { Component } from '@angular/core';
import { MainLayout } from './layouts/main-layout';

@Component({
  selector: 'app-root',
  imports: [MainLayout],
  template: '<app-main-layout />'
})
export class AppComponent {}
