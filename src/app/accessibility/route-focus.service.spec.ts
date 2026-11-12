import { TestBed } from '@angular/core/testing';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { RouteFocusService } from './route-focus.service';

describe('RouteFocusService', () => {
  const events = new Subject<NavigationStart | NavigationEnd>();
  const router = {
    events,
    routerState: { snapshot: { root: { firstChild: null, title: 'Explorar | ACESSA+' } } },
  };

  beforeEach(() => {
    document.body.innerHTML = '<div id="conteudo"><h1>Explorar</h1><section id="equipe"></section></div>';
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: router }] });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    TestBed.resetTestingModule();
  });

  it('scrolls to the page heading after navigation without a fragment', async () => {
    const heading = document.querySelector('h1') as HTMLElement;
    heading.scrollIntoView = vi.fn();
    TestBed.inject(RouteFocusService);

    events.next(new NavigationStart(1, '/explorar'));
    events.next(new NavigationEnd(1, '/explorar', '/explorar'));
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(heading.scrollIntoView).toHaveBeenCalled();
    expect(document.activeElement).toBe(heading);
  });

  it('scrolls to the requested section when the route has a fragment', async () => {
    const section = document.getElementById('equipe') as HTMLElement;
    section.scrollIntoView = vi.fn();
    TestBed.inject(RouteFocusService);

    events.next(new NavigationStart(2, '/sobre#equipe'));
    events.next(new NavigationEnd(2, '/sobre#equipe', '/sobre#equipe'));
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(section.scrollIntoView).toHaveBeenCalled();
    expect(document.activeElement).toBe(section);
  });
});
