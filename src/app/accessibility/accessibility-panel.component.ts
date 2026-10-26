import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { AccessibilityService } from './accessibility.service';
import { SpeechService } from './speech.service';

@Component({
  selector:'app-accessibility-panel',
  template:`
    <button #trigger class="accessibility-trigger" type="button" (click)="toggle()" [attr.aria-expanded]="open()" aria-controls="accessibility-panel" aria-label="Opções de acessibilidade"><i class="bi bi-universal-access" aria-hidden="true"></i><span>Acessibilidade</span></button>
    @if(open()) {
      <section #panel id="accessibility-panel" aria-labelledby="accessibility-title" (keydown.escape)="close($event)">
        <div class="panel-heading"><h2 id="accessibility-title">Acessibilidade</h2><button type="button" (click)="close()" aria-label="Fechar opções de acessibilidade">×</button></div>
        <fieldset><legend>Tamanho do texto</legend><div class="font-controls"><button type="button" (click)="preferences.resize(-25)" [disabled]="preferences.scale() === 100" aria-label="Diminuir fonte">A−</button><output aria-live="polite">{{ preferences.scale() }}%</output><button type="button" (click)="preferences.resize(25)" [disabled]="preferences.scale() === 200" aria-label="Aumentar fonte">A+</button></div></fieldset>
        <button class="wide" type="button" (click)="preferences.toggleContrast()" [attr.aria-pressed]="preferences.contrast()">Alto contraste <span>{{ preferences.contrast() ? 'ativado' : 'desativado' }}</span></button>
        <button class="wide" type="button" (click)="reset()">Restaurar configurações padrão</button>
        <fieldset><legend>Leitura em voz alta</legend>
          <p>Leitura opcional dos títulos e textos principais, usando uma voz local em português. Não substitui seu leitor de tela.</p>
          @if(speech.supported) {
            <div class="speech-controls"><button type="button" (click)="speech.read()">{{ speech.state() === 'idle' ? 'Ler página' : 'Reiniciar leitura' }}</button>
            @if(speech.state() === 'reading'){<button type="button" (click)="speech.pause()">Pausar</button>}
            @if(speech.state() === 'paused'){<button type="button" (click)="speech.resume()">Continuar</button>}
            <button type="button" (click)="speech.stop()" [disabled]="speech.state() === 'idle'">Parar</button></div>
            @if(!speech.voiceAvailable()){<p>Uma voz local em português precisa estar instalada no dispositivo.</p>}
          } @else { <p>A leitura por voz não está disponível neste navegador.</p> }
          <p role="status">{{ speech.message() }}</p>
        </fieldset>
        <p class="panel-note">Você também pode ampliar a página pelo navegador.</p>
      </section>
    }`,
  styleUrl:'./accessibility-panel.component.css',
})
export class AccessibilityPanelComponent {
  readonly preferences = inject(AccessibilityService);
  readonly speech = inject(SpeechService);
  readonly open = signal(false);
  @ViewChild('trigger') trigger!: ElementRef<HTMLButtonElement>;
  @ViewChild('panel') panel?: ElementRef<HTMLElement>;
  toggle(){this.open.update(value=>!value);if(this.open())setTimeout(()=>this.panel?.nativeElement.querySelector<HTMLButtonElement>('button')?.focus());}
  close(event?: Event){event?.preventDefault();event?.stopPropagation();this.open.set(false);this.trigger.nativeElement.focus();}
  reset(){this.preferences.reset();this.speech.stop();}
}
