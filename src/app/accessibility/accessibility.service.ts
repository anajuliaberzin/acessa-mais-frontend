import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  private readonly document = inject(DOCUMENT);
  private readonly key = 'acessa.accessibility.v1';
  readonly scale = signal(100);
  readonly contrast = signal(false);
  constructor() {
    try {
      const value = JSON.parse(this.document.defaultView?.localStorage.getItem(this.key) ?? 'null');
      if (value && [100,125,150,175,200].includes(value.scale)) this.scale.set(value.scale);
      if (value?.contrast === true) this.contrast.set(true);
    } catch { /* Preferências locais são opcionais. */ }
    this.apply();
  }
  resize(delta: number) { this.scale.set(Math.max(100, Math.min(200, this.scale() + delta))); this.save(); }
  toggleContrast() { this.contrast.update(value => !value); this.save(); }
  reset() {
    this.scale.set(100); this.contrast.set(false); this.apply();
    try { this.document.defaultView?.localStorage.removeItem(this.key); } catch { /* Sem armazenamento. */ }
  }
  private apply() {
    this.document.documentElement.style.fontSize = this.scale() + '%';
    this.document.documentElement.dataset['contrast'] = this.contrast() ? 'high' : 'default';
  }
  private save() {
    this.apply();
    try { this.document.defaultView?.localStorage.setItem(this.key, JSON.stringify({scale:this.scale(),contrast:this.contrast()})); } catch { /* A sessão continua funcionando. */ }
  }
}
