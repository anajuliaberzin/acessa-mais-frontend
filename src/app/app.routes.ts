import { Routes } from '@angular/router';

export const routes: Routes = [
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
