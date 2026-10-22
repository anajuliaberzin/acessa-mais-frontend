import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { HeaderComponent } from '../layout/header.component';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

describe('Navegação por sessão e permissão', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  for (const gestor of [false, true]) {
    it('mostra Perfil após login e Admin apenas se gestor=' + gestor, async () => {
      const fixture = TestBed.createComponent(HeaderComponent);
      vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      const http = TestBed.inject(HttpTestingController);
      await fixture.whenStable();
      const element: HTMLElement = fixture.nativeElement;
      expect(element.querySelector('a[href="/perfil"]')).toBeNull();
      expect(element.querySelector('a[href="/painel"]')).toBeNull();
      TestBed.inject(AuthService).login('usuario', 'senha').subscribe();
      http
        .expectOne((r) => r.url.endsWith('/auth/login/'))
        .flush({ access: 'jwt', refresh: 'refresh' });
      await fixture.whenStable();
      expect(element.querySelector('a[href="/perfil"]')).not.toBeNull();
      expect(element.querySelector('a[href="/painel"]')).toBeNull();
      const perfil = http.expectOne((r) => r.url.endsWith('/me/'));
      expect(perfil.request.headers.get('Authorization')).toBe('Bearer jwt');
      perfil.flush({
        id: 1,
        nome: 'Pessoa real',
        cidade: 'Sorocaba',
        uf: 'SP',
        membroDesde: '2026-01-01',
        preferencias: [],
        gestor,
      });
      await fixture.whenStable();
      expect(!!element.querySelector('a[href="/painel"]')).toBe(gestor);
      TestBed.inject(AuthService).logout();
      await fixture.whenStable();
      expect(element.querySelector('a[href="/perfil"]')).toBeNull();
      expect(element.querySelector('a[href="/painel"]')).toBeNull();
    });
  }
});
