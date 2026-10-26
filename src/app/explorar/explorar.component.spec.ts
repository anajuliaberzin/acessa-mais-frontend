import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { ExplorarComponent } from './explorar.component';
import { Local, Pagina, PlataformaService } from '../services/plataforma.service';

describe('Explorar locais', () => {
  const resposta = (): Pagina<Local> => ({ count: 0, next: null, previous: null, results: [] });
  it('preserva os filtros dos atalhos e envia somente recursos conhecidos para a API', () => {
    const locais = vi.fn().mockReturnValue(of(resposta()));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: PlataformaService,
          useValue: { filtros: () => of({ categorias: ['hospital'] }), locais },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(
              convertToParamMap({
                categoria: 'hospital',
                necessidade: 'mobilidade',
                recursos: 'rampa,inexistente',
              }),
            ),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(ExplorarComponent);
    expect(locais).toHaveBeenLastCalledWith(
      expect.objectContaining({
        categoria: 'hospital',
        necessidade: 'mobilidade',
        recursos: 'rampa',
        page: 1,
      }),
    );
    fixture.componentInstance.alternar('banheiro_adaptado');
    expect(locais).toHaveBeenLastCalledWith(
      expect.objectContaining({ recursos: 'rampa,banheiro_adaptado', page: 1 }),
    );
    fixture.componentInstance.limpar();
    expect(locais).toHaveBeenLastCalledWith(
      expect.objectContaining({ categoria: '', necessidade: '', recursos: '', page: 1 }),
    );
  });
  it('mantém o resultado da busca mais recente quando as respostas chegam fora de ordem', () => {
    const antiga = new Subject<Pagina<Local>>();
    const recente = new Subject<Pagina<Local>>();
    const locais = vi.fn().mockReturnValueOnce(antiga).mockReturnValueOnce(recente);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: PlataformaService, useValue: { filtros: () => of({ categorias: [] }), locais } },
        { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap({})) } },
      ],
    });
    const component = TestBed.createComponent(ExplorarComponent).componentInstance;
    component.nome = 'Hospital';
    component.buscar();
    recente.next({ ...resposta(), count: 2 });
    antiga.next({ ...resposta(), count: 20 });
    expect(component.pagina()?.count).toBe(2);
    expect(component.carregando()).toBe(false);
    antiga.error(new Error('resposta antiga'));
    expect(component.erro()).toBe('');
  });
});
