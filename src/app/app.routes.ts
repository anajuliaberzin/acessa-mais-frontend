import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';
import { superadminGuard } from './auth/superadmin.guard';

export const routes: Routes = [
  { path: 'admin/locais/novo', canActivate: [superadminGuard], title: 'Cadastrar local | ACESSA+',
    loadComponent: () => import('./locais/cadastrar-local.component').then(m => m.CadastrarLocalComponent) },
  { path: 'sobre', loadComponent: () => import('./sobre/sobre.component').then(m => m.SobreComponent), title: 'Quem somos nós | ACESSA+' },
  { path: 'cadastro', loadComponent: () => import('./auth/cadastro.component').then(m => m.CadastroComponent), title: 'Criar conta | ACESSA+' },
  {
    path: 'explorar',
    loadComponent: () => import('./explorar/explorar.component').then((m) => m.ExplorarComponent),
    title: 'Explorar Sorocaba | ACESSA+',
  },
  {
    path: 'painel',
    title: 'Painel do município | ACESSA+',
    canActivate: [adminGuard],
    loadComponent: () => import('./painel/painel.component').then((m) => m.PainelComponent),
  },
  {
    path: 'ocorrencias',
    title: 'Minhas ocorrências | ACESSA+',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./ocorrencias/ocorrencias.component').then((m) => m.OcorrenciasComponent),
  },
  {
    path: 'rotas',
    loadComponent: () => import('./rotas/rotas.component').then((m) => m.RotasComponent),
    title: 'Rotas acessíveis | ACESSA+',
  },
  {
    path: 'login',
    title: 'Entrar | ACESSA+',
    loadComponent: () => import('./auth/login.component').then((module) => module.LoginComponent),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    title: 'Início | ACESSA+',
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
    canActivate: [authGuard],
    loadComponent: () => import('./perfil/perfil.component').then((m) => m.PerfilComponent),
    title: 'Meu perfil | ACESSA+',
  },
];
