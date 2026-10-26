import { DOCUMENT } from '@angular/common';
import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class SpeechService implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly synth = this.document.defaultView?.speechSynthesis;
  readonly supported = !!this.synth;
  readonly state = signal<'idle'|'reading'|'paused'>('idle');
  readonly message = signal('');
  readonly voiceAvailable = signal(false);
  private voice?: SpeechSynthesisVoice;
  private generation = 0;
  private utterance?: SpeechSynthesisUtterance;
  private readonly updateVoices = () => {
    const voices = this.synth?.getVoices() ?? [];
    this.voice = voices.find(v => v.localService && /^pt[-_]BR$/i.test(v.lang)) ?? voices.find(v => v.localService && /^pt\b/i.test(v.lang));
    this.voiceAvailable.set(!!this.voice);
  };
  constructor() {
    this.updateVoices(); this.synth?.addEventListener('voiceschanged', this.updateVoices);
    inject(Router).events.pipe(takeUntilDestroyed()).subscribe(event => {if (event instanceof NavigationStart) this.stop();});
  }
  read() {
    this.stop(); this.updateVoices();
    if (!this.synth || !this.voice) {this.message.set('Instale uma voz local em português nas configurações do dispositivo para usar a leitura.');return;}
    const text = Array.from(this.document.querySelectorAll<HTMLElement>('main h1, main h2, main [data-read-aloud]'))
      .filter(el => !el.closest('form, nav, [hidden], [aria-hidden="true"]') && el.getClientRects().length > 0)
      .map(el => el.innerText ?? el.textContent ?? '').join('. ').replace(/\s+/g,' ').trim();
    if (!text) {this.message.set('Não há conteúdo disponível para leitura nesta tela.');return;}
    const chunks = text.match(/.{1,220}(?:\s|$)|\S{1,220}/g) ?? [text];
    const generation = this.generation;
    this.state.set('reading'); this.message.set('Lendo os títulos e os textos principais da página.');
    const next = (index: number) => {
      if (generation !== this.generation) return;
      if (index >= chunks.length) {this.state.set('idle');this.message.set('Leitura concluída.');return;}
      const utterance = new SpeechSynthesisUtterance(chunks[index]); this.utterance = utterance;
      utterance.voice = this.voice!; utterance.lang = this.voice!.lang; utterance.rate = 1;
      utterance.onend = () => next(index + 1);
      utterance.onerror = () => {if(generation === this.generation){this.stop();this.message.set('A leitura foi interrompida. Você pode tentar novamente.');}};
      this.synth!.speak(utterance);
    };
    next(0);
  }
  pause() { if(this.state() === 'reading'){this.synth?.pause();this.state.set('paused');this.message.set('Leitura pausada.');} }
  resume() { if(this.state() === 'paused'){this.synth?.resume();this.state.set('reading');this.message.set('Leitura retomada.');} }
  stop() {this.generation++;this.synth?.cancel();this.utterance = undefined;this.state.set('idle');this.message.set('');}
  ngOnDestroy() {this.stop();this.synth?.removeEventListener('voiceschanged',this.updateVoices);}
}
