import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'painel', canActivate: [authGuard], loadComponent: () => import('./painel/painel.component').then(m => m.PainelComponent) },
  { path: 'ocorrencias', canActivate: [authGuard], loadComponent: () => import('./ocorrencias/ocorrencias.component').then(m => m.OcorrenciasComponent) },
  {
    path: 'rotas',
    loadComponent: () => import('./rotas/rotas.component').then((m) => m.RotasComponent),
    title: 'Rotas acessíveis | ACESSA+',
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then((module) => module.LoginComponent),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'reportar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./reportar-problema/reportar-problema.component').then(
        (m) => m.ReportarProblemaComponent,
      ),
    title: 'Reportar problema | ACESSA+',
  },
  {
    path: 'perfil',
    loadComponent: () => import('./perfil/perfil.component').then((m) => m.PerfilComponent),
    title: 'Meu perfil | ACESSA+',
  },
];
