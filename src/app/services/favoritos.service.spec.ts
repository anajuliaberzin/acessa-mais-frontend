import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { PlataformaService } from './plataforma.service';
import { FavoritosService } from './favoritos.service';

describe('FavoritosService', () => {
  it('carrega todas as páginas e atualiza os IDs após favoritar e desfavoritar', () => {
    const primeiraPagina = {
      count: 2,
      next: 'page=2',
      previous: null,
      results: [{ id: 8 }, { id: 11 }],
    };
    const segundaPagina = {
      count: 2,
      next: null,
      previous: 'page=1',
      results: [{ id: 16 }],
    };
    const api = {
      meusFavoritos: vi.fn().mockReturnValueOnce(of(primeiraPagina)).mockReturnValueOnce(of(segundaPagina)),
      adicionarFavorito: vi.fn().mockReturnValue(of(void 0)),
      removerFavorito: vi.fn().mockReturnValue(of(void 0)),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: signal(true), sessionId: signal(1) } },
        { provide: PlataformaService, useValue: api },
      ],
    });
    const favoritos = TestBed.inject(FavoritosService);
    TestBed.flushEffects();

    expect(api.meusFavoritos).toHaveBeenNthCalledWith(1, 1, 100);
    expect(api.meusFavoritos).toHaveBeenNthCalledWith(2, 2, 100);
    expect(favoritos.ids()).toEqual(new Set([8, 11, 16]));

    favoritos.adicionar(21).subscribe();
    expect(favoritos.ids().has(21)).toBe(true);
    favoritos.remover(11).subscribe();
    expect(favoritos.ids().has(11)).toBe(false);
  });
});
