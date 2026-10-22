import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header.component';

@Component({
  imports: [RouterOutlet, HeaderComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  template: `<app-header />
    <div id="conteudo" tabindex="-1"><router-outlet /></div>`,
})
export class App {}
