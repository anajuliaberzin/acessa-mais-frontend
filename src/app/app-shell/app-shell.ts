import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LogoComponent } from '../logo/logo';

interface ItemMenu {
  rotulo: string;
  rota: string;
  icone: string; // classe do Bootstrap Icons
}

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LogoComponent],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell {
  // Os mesmos itens servem para a navbar e para a bottom bar
  menu: ItemMenu[] = [
    { rotulo: 'Início', rota: '/home', icone: 'bi-house' },
    { rotulo: 'Rotas', rota: '/rotas', icone: 'bi-signpost-split' },
    { rotulo: 'Reportar', rota: '/reportar', icone: 'bi-exclamation-circle' },
    { rotulo: 'Painel', rota: '/painel', icone: 'bi-bar-chart-line' },
    { rotulo: 'Perfil', rota: '/perfil', icone: 'bi-person' },
    { rotulo: 'Mapa', rota: '/mapa', icone: 'bi-map' },
  ];
}