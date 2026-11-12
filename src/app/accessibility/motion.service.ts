import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly key = 'acessa.motion.reduced.v1';
  private readonly userPreference = signal(false);
  private readonly systemPreference = signal(false);
  readonly userReduced = this.userPreference.asReadonly();
  readonly systemReduced = this.systemPreference.asReadonly();
  readonly reduced = computed(() => this.userReduced() || this.systemReduced());
  private initialized = false;
  private mediaQuery?: MediaQueryList;
  private readonly onSystemPreferenceChange = (event: MediaQueryListEvent) => {
    this.systemPreference.set(event.matches);
    this.apply();
  };

  initialize() {
    if (this.initialized || !isPlatformBrowser(this.platformId)) return;
    this.initialized = true;
    const view = this.document.defaultView;
    if (!view) return;

    try {
      this.userPreference.set(view.localStorage.getItem(this.key) === 'true');
    } catch {
      // Motion controls remain usable when browser storage is unavailable.
    }

    this.mediaQuery = view.matchMedia('(prefers-reduced-motion: reduce)');
    this.systemPreference.set(this.mediaQuery.matches);
    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', this.onSystemPreferenceChange);
    } else {
      this.mediaQuery.addListener(this.onSystemPreferenceChange);
    }
    this.apply();
  }

  toggle() {
    this.userPreference.update((value) => !value);
    try {
      this.document.defaultView?.localStorage.setItem(this.key, String(this.userReduced()));
    } catch {
      // Motion controls remain usable when browser storage is unavailable.
    }
    this.apply();
  }

  reset() {
    this.userPreference.set(false);
    try {
      this.document.defaultView?.localStorage.removeItem(this.key);
    } catch {
      // Motion controls remain usable when browser storage is unavailable.
    }
    this.apply();
  }

  private apply() {
    this.document.documentElement.classList.toggle('reduce-motion', this.reduced());
  }
}
