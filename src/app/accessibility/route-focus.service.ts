import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({providedIn:'root'})
export class RouteFocusService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private generation = 0;
  readonly announcement = signal('');
  constructor(){
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event=>{
      if(event instanceof NavigationStart)this.generation++;
      if(!(event instanceof NavigationEnd))return;
      const generation = this.generation;
      const title = this.pageTitle();
      this.announcement.set(title ? `Página ${title} carregada.` : 'Página carregada.');
      setTimeout(()=>{
        if(generation !== this.generation)return;
        const fragment = event.urlAfterRedirects.split('#')[1];
        let target: HTMLElement | null = null;
        try {if(fragment)target=this.document.getElementById(decodeURIComponent(fragment));}catch{/* Fragmento inválido. */}
        target ??= this.document.querySelector<HTMLElement>('#conteudo h1') ?? this.document.getElementById('conteudo');
        if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});target.scrollIntoView?.();}
      });
    });
  }

  private pageTitle() {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route.title?.split('|')[0].trim() ?? '';
  }
}
