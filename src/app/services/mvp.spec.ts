import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { authInterceptor } from '../auth/auth.interceptor';
import { routes } from '../app.routes';
import { OcorrenciaService } from './ocorrencia.service';
import { PlataformaService } from './plataforma.service';
import { HomeComponent } from '../home/home.component';
import { ReportarProblemaComponent } from '../reportar-problema/reportar-problema.component';

describe('Fluxos do MVP', () => {
  const base = 'http://127.0.0.1:8000/api';
  let backend: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()] });
    backend = TestBed.inject(HttpTestingController);
  });
  afterEach(() => backend.verify());
  function login() {
    TestBed.inject(AuthService).login('usuario', 'senha').subscribe();
    backend.expectOne(base + '/auth/login/').flush({ access: 'jwt-teste', refresh: 'refresh-teste' });
  }

  it('consulta locais sem credenciais mesmo com usuário autenticado', () => {
    login();
    TestBed.inject(PlataformaService).locais({ nome: 'Biblioteca', recursos: 'rampa' }).subscribe();
    const req = backend.expectOne(r => r.url === base + '/locais/');
    expect(req.request.params.get('nome')).toBe('Biblioteca');
    expect(req.request.params.get('recursos')).toBe('rampa');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ count: 0, results: [], next: null, previous: null });
  });

  it('mostra estado vazio e ignora resposta antiga na busca', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    backend.expectOne(base + '/locais/filtros/').flush({ categorias: ['cultura'] });
    const antiga = backend.expectOne(r => r.url === base + '/locais/');
    component.nome = 'Biblioteca'; component.buscar();
    const nova = backend.expectOne(r => r.url === base + '/locais/');
    nova.flush({ count: 0, results: [], next: null, previous: null });
    antiga.flush({ count: 3, results: [], next: null, previous: null });
    fixture.detectChanges();
    expect(component.pagina()?.count).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Nenhum local encontrado');
  });
});
