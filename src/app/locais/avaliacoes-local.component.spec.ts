import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Local, MinhaAvaliacao, PlataformaService } from '../services/plataforma.service';
import { AvaliacoesLocalComponent } from './avaliacoes-local.component';

describe('AvaliacoesLocalComponent', () => {
  const local: Local = {
    id: 8,
    nome: 'Biblioteca',
    categoria: 'cultura',
    endereco: 'Centro, Sorocaba/SP',
    descricao: '',
    recursos: {},
    fotos: [],
    acessibilidade: { nota: null, classificacao: null },
    media_avaliacoes: 3,
    total_avaliacoes: 1,
  };
  const avaliacao: MinhaAvaliacao = {
    id: 4,
    local: local.id,
    nomeLocal: local.nome,
    nota: 3,
    comentario: 'Boa estrutura.',
    created_at: '2026-01-01T10:00:00Z',
  };
  const pagina = (results: MinhaAvaliacao[]) => ({
    count: results.length,
    next: null,
    previous: null,
    results,
  });

  it('edita a própria avaliação e atualiza o resumo e a lista após a resposta da API', () => {
    const atualizada = { ...local, media_avaliacoes: 4, total_avaliacoes: 1 };
    const api = {
      local: vi.fn().mockReturnValue(of(atualizada)),
      avaliacoesLocal: vi.fn().mockReturnValue(of(pagina([{ ...avaliacao, nota: 4, comentario: 'Atualizada.' }]))),
      minhaAvaliacaoLocal: vi.fn().mockReturnValue(of(pagina([{ ...avaliacao, nota: 4, comentario: 'Atualizada.' }]))),
      atualizarAvaliacao: vi.fn().mockReturnValue(of({ ...avaliacao, nota: 4 })),
    };
    TestBed.configureTestingModule({
      imports: [AvaliacoesLocalComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: signal(true) } },
        { provide: PlataformaService, useValue: api },
      ],
    });
    const fixture = TestBed.createComponent(AvaliacoesLocalComponent);
    fixture.componentRef.setInput('local', local);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.localAtualizado.subscribe((value) => fixture.componentRef.setInput('local', value));
    component.nota = 4;
    component.comentario = 'Atualizada.';
    component.salvar();
    fixture.detectChanges();

    expect(api.atualizarAvaliacao).toHaveBeenCalledWith(avaliacao.id, 4, 'Atualizada.');
    expect(component.minhaAvaliacao()?.nota).toBe(4);
    expect(component.avaliacoes()[0].comentario).toBe('Atualizada.');
    expect(fixture.nativeElement.textContent).toContain('4.0/5');
    expect(fixture.nativeElement.textContent).toContain('Atualizada.');
  });

  it('orienta usuários anônimos a entrar e não solicita avaliações privadas', () => {
    const api = {
      local: vi.fn().mockReturnValue(of(local)),
      avaliacoesLocal: vi.fn().mockReturnValue(of(pagina([]))),
      minhaAvaliacaoLocal: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [AvaliacoesLocalComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: signal(false) } },
        { provide: PlataformaService, useValue: api },
      ],
    });
    const fixture = TestBed.createComponent(AvaliacoesLocalComponent);
    fixture.componentRef.setInput('local', local);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Entre na sua conta');
    expect(api.minhaAvaliacaoLocal).not.toHaveBeenCalled();
  });
});
