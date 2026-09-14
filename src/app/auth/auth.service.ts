import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, map, Observable, shareReplay, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';

interface Tokens {
  access: string;
  refresh: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly tokens = signal<Tokens | null>(null);
  private refreshRequest?: Observable<string>;
  private version = 0;
  readonly isAuthenticated = computed(() => this.tokens() !== null);
  readonly accessToken = computed(() => this.tokens()?.access ?? null);

  login(username: string, password: string) {
    const version = ++this.version;
    return this.http.post<Tokens>(this.baseUrl + '/auth/login/', { username, password }).pipe(
      tap((tokens) => {
        if (version === this.version) this.tokens.set(tokens);
      }),
    );
  }

  refresh(): Observable<string> {
    if (this.refreshRequest) return this.refreshRequest;
    const tokens = this.tokens();
    const version = this.version;
    const request = this.http.post<{ access: string }>(this.baseUrl + '/auth/refresh/', {
      refresh: tokens?.refresh,
    }).pipe(
      map((response) => {
        if (!tokens || version !== this.version) throw new Error('Session changed');
        this.tokens.set({ ...tokens, access: response.access });
        return response.access;
      }),
      finalize(() => {
        if (this.refreshRequest === request) this.refreshRequest = undefined;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.refreshRequest = request;
    return request;
  }

  logout() {
    this.version++;
    this.tokens.set(null);
    this.refreshRequest = undefined;
    void this.router.navigate(['/home']);
  }

  expireSession() {
    this.version++;
    this.tokens.set(null);
    this.refreshRequest = undefined;
    void this.router.navigate(['/login'], { queryParams: { expired: '1' } });
  }
}
