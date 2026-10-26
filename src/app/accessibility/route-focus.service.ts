import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({providedIn:'root'})
export class RouteFocusService {
  private readonly document = inject(DOCUMENT);
  private generation = 0;
  constructor(){
    inject(Router).events.pipe(takeUntilDestroyed()).subscribe(event=>{
      if(event instanceof NavigationStart)this.generation++;
      if(!(event instanceof NavigationEnd))return;
      const generation = this.generation;
      setTimeout(()=>{
        if(generation !== this.generation)return;
        const fragment = event.urlAfterRedirects.split('#')[1];
        let target: HTMLElement | null = null;
        try {if(fragment)target=this.document.getElementById(decodeURIComponent(fragment));}catch{/* Fragmento inválido. */}
        target ??= this.document.querySelector<HTMLElement>('#conteudo h1') ?? this.document.getElementById('conteudo');
        if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});if(fragment)target.scrollIntoView?.();}
      });
    });
  }
}
