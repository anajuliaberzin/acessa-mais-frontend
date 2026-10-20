import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { RotasComponent } from './rotas.component';

describe('Rotas acessíveis', () => {
  async function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/rotas', RotasComponent);
    const element = harness.routeNativeElement!;
    async function preencher(origem: string, destino: string) {
      for (const [id, value] of [
        ['origem', origem],
        ['destino', destino],
      ]) {
        const input = element.querySelector<HTMLInputElement>('#' + id)!;
        input.value = value;
        input.dispatchEvent(new Event('input'));
      }
      await harness.fixture.whenStable();
    }
    async function comparar() {
      element.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
      await harness.fixture.whenStable();
      harness.detectChanges();
    }
    return { harness, element, preencher, comparar };
  }

  it('abre pela URL com campos rotulados e sem trajeto inicial', async () => {
    const { element } = await setup();
    expect(element.querySelector('h1')?.textContent).toContain('Rotas acessíveis');
    for (const id of ['origem', 'destino']) {
      expect(element.querySelector(`label[for="${id}"]`)).toBeTruthy();
      expect(element.querySelector<HTMLInputElement>('#' + id)?.value).toBe('');
    }
    expect(element.querySelector('.active-route')).toBeNull();
    expect(element.querySelectorAll('input[type="radio"]')).toHaveLength(0);
  });

  it('valida campos ausentes e espaços em branco sem mostrar rotas', async () => {
    const { element, preencher, comparar } = await setup();
    await comparar();
    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Informe a origem e o destino',
    );
    expect(element.querySelector('#origem')?.getAttribute('aria-invalid')).toBe('true');
    await preencher('Praça', '   ');
    await comparar();
    expect(element.querySelector('#destino')?.getAttribute('aria-invalid')).toBe('true');
    expect(element.querySelector('.active-route')).toBeNull();
  });

  it('compara as opções e atualiza seleção, anúncio e traçado nas duas direções', async () => {
    const { element, harness, preencher, comparar } = await setup();
    await preencher('Praça', 'Biblioteca');
    await comparar();
    expect(element.querySelectorAll('.route-card')).toHaveLength(2);
    for (const card of element.querySelectorAll('.route-card')) {
      expect(card.textContent).toContain('min');
      expect(card.textContent).toContain('Acessibilidade:');
      expect(card.textContent).toContain('Principais barreiras');
    }
    const accessiblePath = element.querySelector('.active-route')!.getAttribute('d');
    for (const id of ['rapida', 'acessivel']) {
      const radio = element.querySelector<HTMLInputElement>(`input[value="${id}"]`)!;
      radio.click();
      await harness.fixture.whenStable();
      harness.detectChanges();
      expect(radio.checked).toBe(true);
      expect(element.querySelectorAll('.route-card.selected')).toHaveLength(1);
      expect(element.querySelector('.route-card.selected input')).toBe(radio);
      expect(element.querySelector('.active-route')!.getAttribute('data-route')).toBe(id);
      expect(element.querySelector('[role="status"]')!.textContent).toContain(
        id === 'rapida' ? 'Rota mais rápida selecionada' : 'Rota mais acessível selecionada',
      );
      const path = element.querySelector('.active-route')!.getAttribute('d');
      if (id === 'rapida') expect(path).not.toBe(accessiblePath);
      else expect(path).toBe(accessiblePath);
    }
    expect(element.querySelector('.map-caption')!.textContent).toContain('Praça');
    expect(element.querySelector('.map-caption')!.textContent).toContain('Biblioteca');
  });

  it('limpa resultados ao editar e permite uma nova consulta', async () => {
    const { element, preencher, comparar } = await setup();
    await preencher('Praça', 'Biblioteca');
    await comparar();
    await preencher('Terminal', 'Hospital');
    expect(element.querySelector('.active-route')).toBeNull();
    await comparar();
    expect(element.querySelectorAll('.route-card')).toHaveLength(2);
    expect(element.querySelector('.map-caption')!.textContent).toContain('Terminal');
  });

  it('informa ausência de trajeto quando os dois lugares são iguais', async () => {
    const { element, preencher, comparar } = await setup();
    await preencher(' Praça ', 'praça');
    await comparar();
    expect(element.querySelector('[role="status"]')!.textContent).toContain(
      'origem e destino são iguais',
    );
    expect(element.querySelector('.active-route')).toBeNull();
  });
});
