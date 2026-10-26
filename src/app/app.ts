import { Component } from '@angular/core';
import { AppShell } from './app-shell/app-shell';

@Component({
  imports: [AppShell],
  selector: 'app-root',
  styleUrl: './app.css',
  template: `<app-shell />`,
})
export class App {}
