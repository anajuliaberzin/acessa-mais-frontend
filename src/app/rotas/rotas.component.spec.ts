import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RotasComponent } from './rotas.component';
import { ComparacaoApi, RotaApi } from './rotas.service';
import { authInterceptor } from '../auth/auth.interceptor';

const url = 'http://127.0.0.1:8000/api/rotas/comparar/';
function resposta(): ComparacaoApi {
  const rapida: RotaApi = {
    tempo_minutos: 12,
    distancia_metros: 950,
    score_acessibilidade: null,
    barreiras: [{ tipo: 'escada', descricao: 'Escada identificada', trecho: [0, 1] }],
    acessibilidade_avaliada: false,
    nivel_confianca: 'limitado',
    geometria: {
      type: 'LineString',
      coordinates: [
        [-47.4526, -23.5015],
        [-47.46, -23.51],
      ],
    },
  };
  return {
    rota_rapida: rapida,
    rota_acessivel: null,
    alternativas: [
      {
        ...rapida,
        tempo_minutos: 17,
        distancia_metros: 1200,
        barreiras: [],
        geometria: {
          type: 'LineString',
          coordinates: [
            [-47.4526, -23.5015],
            [-47.4526, -23.51],
            [-47.46, -23.51],
          ],
        },
      },
    ],
    acessibilidade_avaliada: false,
    nivel_confianca: 'limitado',
    mensagem: 'Não há dados suficientes para determinar uma rota mais acessível.',
  };
}

describe('Rotas integradas à API', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  async function setup() {
    const fixture = TestBed.createComponent(RotasComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    async function preencher(values = ['-23.5015', '-47.4526', '-23.5100', '-47.4600']) {
      const ids = ['origem-latitude', 'origem-longitude', 'destino-latitude', 'destino-longitude'];
      ids.forEach((id, i) => {
        const input = element.querySelector<HTMLInputElement>('#' + id)!;
        input.value = values[i];
        input.dispatchEvent(new Event('input'));
      });
      await fixture.whenStable();
    }
    function enviar() {
      element.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
      fixture.detectChanges();
    }
    return { fixture, element, preencher, enviar };
  }

  it('inicia com quatro campos rotulados, sem resultados', async () => {
    const { element } = await setup();
    for (const input of element.querySelectorAll('input[type=number]')) {
      expect(element.querySelector('label[for="' + input.id + '"]')).toBeTruthy();
    }
    expect(element.querySelectorAll('input[type=number]')).toHaveLength(4);
    expect(element.querySelector('.active-route')).toBeNull();
    http.expectNone(url);
  });

  it('valida campos ausentes, limites e coordenadas iguais sem chamar API', async () => {
    const { element, preencher, enviar } = await setup();
    enviar();
    expect(element.querySelector('[role=alert]')?.textContent).toContain('Informe a origem');
    await preencher(['91', '-47', '-23', '-181']);
    enviar();
    expect(element.querySelector('#origem-latitude')?.getAttribute('aria-invalid')).toBe('true');
    await preencher(['0', '0', '0', '0']);
    enviar();
    expect(element.querySelector('[role=status]')?.textContent).toContain('são iguais');
    http.expectNone(url);
  });

  it('envia coordenadas numéricas sem token e mostra carregamento', async () => {
    const { element, preencher, enviar, fixture } = await setup();
    await preencher();
    enviar();
    expect(element.querySelector<HTMLButtonElement>('button[type=submit]')?.disabled).toBe(true);
    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      origem: { latitude: -23.5015, longitude: -47.4526 },
      destino: { latitude: -23.51, longitude: -47.46 },
    });
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush(resposta());
    await fixture.whenStable();
    expect(element.querySelector<HTMLButtonElement>('button[type=submit]')?.disabled).toBe(false);
    expect(element.querySelectorAll('.route-card')).toHaveLength(2);
    expect(element.querySelector('.accessibility-note')?.textContent).toContain('não determinada');
    expect(element.querySelector('.score')?.textContent).toContain('não avaliada');
  });

  it('troca a seleção e o SVG usando as geometrias recebidas', async () => {
    const { element, preencher, enviar, fixture } = await setup();
    await preencher();
    enviar();
    http.expectOne(url).flush(resposta());
    await fixture.whenStable();
    const original = element.querySelector('.active-route')!.getAttribute('d');
    for (const id of ['alternativa-1', 'rapida']) {
      element.querySelector<HTMLInputElement>('input[value="' + id + '"]')!.click();
      await fixture.whenStable();
      expect(element.querySelectorAll('.route-card.selected')).toHaveLength(1);
      expect(element.querySelector('.active-route')?.getAttribute('data-route')).toBe(id);
      if (id === 'rapida')
        expect(element.querySelector('.active-route')?.getAttribute('d')).toBe(original);
      else expect(element.querySelector('.active-route')?.getAttribute('d')).not.toBe(original);
    }
  });

  it('não inventa uma segunda opção quando a API retorna apenas uma rota', async () => {
    const { element, preencher, enviar, fixture } = await setup();
    await preencher();
    enviar();
    http.expectOne(url).flush({ ...resposta(), alternativas: [] });
    await fixture.whenStable();
    expect(element.querySelectorAll('.route-card')).toHaveLength(1);
    expect(element.querySelector('input[value=acessivel]')).toBeNull();
  });

  it('cancela consulta anterior ao editar e permite nova tentativa', async () => {
    const { element, preencher, enviar, fixture } = await setup();
    await preencher();
    enviar();
    const primeira = http.expectOne(url);
    await preencher(['-23.50', '-47.45', '-23.52', '-47.46']);
    expect(primeira.cancelled).toBe(true);
    expect(element.querySelector('.active-route')).toBeNull();
    enviar();
    http.expectOne(url).flush(resposta());
    await fixture.whenStable();
    expect(element.querySelector('.active-route')).toBeTruthy();
    await preencher();
    expect(element.querySelector('.active-route')).toBeNull();
  });

  for (const [status, texto] of [
    [400, 'coordenadas'],
    [404, 'Nenhuma rota'],
    [502, 'inválida'],
    [503, 'indisponível'],
    [504, 'demorou'],
  ] as const) {
    it('trata HTTP ' + status + ' sem mostrar resultados fictícios', async () => {
      const { element, preencher, enviar, fixture } = await setup();
      await preencher();
      enviar();
      http.expectOne(url).flush({ detail: 'mensagem interna' }, { status, statusText: 'Error' });
      await fixture.whenStable();
      expect(element.textContent).toContain(texto);
      expect(element.textContent).not.toContain('mensagem interna');
      expect(element.querySelector('.active-route')).toBeNull();
      expect(element.querySelector<HTMLButtonElement>('button[type=submit]')?.disabled).toBe(false);
    });
  }

  it('trata backend desconectado', async () => {
    const { element, preencher, enviar, fixture } = await setup();
    await preencher();
    enviar();
    http.expectOne(url).error(new ProgressEvent('error'));
    await fixture.whenStable();
    expect(element.textContent).toContain('Não foi possível conectar');
  });

  it('rejeita contrato inválido e geometria ausente', async () => {
    const { element, preencher, enviar, fixture } = await setup();
    await preencher();
    enviar();
    http.expectOne(url).flush({ rota_rapida: {} });
    await fixture.whenStable();
    expect(element.textContent).toContain('não pôde ser interpretada');
    expect(element.querySelector('.active-route')).toBeNull();
  });

  it('mostra candidata provisória sem transformar score null em zero', async () => {
    const { element, preencher, enviar, fixture } = await setup();
    const data = resposta();
    data.rota_acessivel = data.alternativas[0];
    data.alternativas = [];
    await preencher();
    enviar();
    http.expectOne(url).flush(data);
    await fixture.whenStable();
    expect(element.textContent).toContain('Candidata com avaliação limitada');
    expect(element.textContent).not.toContain('0/100');
    expect(element.querySelectorAll('.accessible')).toHaveLength(0);
  });

  it('cancela requisição ao sair da tela', async () => {
    const { preencher, enviar, fixture } = await setup();
    await preencher();
    enviar();
    const request = http.expectOne(url);
    fixture.destroy();
    expect(request.cancelled).toBe(true);
  });
});
