import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { PerfilComponent } from './perfil.component';
import { PlataformaService, PerfilAtual } from '../services/plataforma.service';
import { SessaoService } from '../auth/sessao.service';
import { signal } from '@angular/core';

describe('Perfil real', () => {
  it('exibe a identidade da API, mantém a preferência em falha e salva apenas após confirmação do backend', async () => {
    const usuario: PerfilAtual = {
      id: 7,
      nome: 'Maria Real',
      cidade: 'Sorocaba',
      uf: 'SP',
      membroDesde: '2026-01-01',
      preferencias: [],
      gestor: false,
    };
    const falha = new Subject<PerfilAtual>();
    const sucesso = new Subject<PerfilAtual>();
    const salvarPreferencias = vi.fn().mockReturnValueOnce(falha).mockReturnValueOnce(sucesso);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: SessaoService, useValue: { perfil: signal(null) } },
        {
          provide: PlataformaService,
          useValue: {
            perfil: () => of(usuario),
            minhasAvaliacoes: () => of({ count: 0, results: [], next: null, previous: null }),
            salvarPreferencias,
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(PerfilComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Maria Real');
    expect(fixture.nativeElement.textContent).not.toContain('Ana Julia');
    expect(fixture.nativeElement.textContent).toContain('Você ainda não avaliou');
    const c = fixture.componentInstance;
    c.alternarPreferencia('cadeirante');
    falha.error(new Error('offline'));
    expect(c.usuario()?.preferencias).toEqual([]);
    c.alternarPreferencia('cadeirante');
    sucesso.next({ ...usuario, preferencias: ['cadeirante'] });
    expect(c.usuario()?.preferencias).toEqual(['cadeirante']);
    expect(salvarPreferencias).toHaveBeenLastCalledWith(['cadeirante']);
  });
});
