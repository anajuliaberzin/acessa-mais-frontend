import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { authInterceptor, REQUIRE_AUTH } from './auth.interceptor';
import { authGuard } from './auth.guard';
import { LoginComponent } from './login.component';

describe('JWT authentication', () => {
  const base = 'http://127.0.0.1:8000/api';
  let auth: AuthService;
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => backend.verify());

  function login() {
    auth.login('usuario', 'senha').subscribe();
    const request = backend.expectOne(base + '/auth/login/');
    expect(request.request.body).toEqual({ username: 'usuario', password: 'senha' });
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ access: 'access', refresh: 'refresh' });
  }

  function privateRequest(path: string) {
    return http.get(base + path, {
      context: new HttpContext().set(REQUIRE_AUTH, true),
    });
  }

  it('logs in and keeps public and external requests free of credentials', () => {
    login();
    expect(auth.isAuthenticated()).toBe(true);
    for (const url of [base + '/locais/', base + '/locais/1/?nome=parque', 'https://example.org/api/private/']) {
      http.get(url).subscribe();
      const request = backend.expectOne(url);
      expect(request.request.headers.has('Authorization')).toBe(false);
      request.flush({});
    }
  });

  it('shares refresh across concurrent failures and retries each request once', () => {
    login();
    for (const path of ['/private/1/', '/private/2/']) {
      privateRequest(path).subscribe();
      const request = backend.expectOne(base + path);
      expect(request.request.headers.get('Authorization')).toBe('Bearer access');
      request.flush({}, { status: 401, statusText: 'Unauthorized' });
    }
    const refresh = backend.expectOne(base + '/auth/refresh/');
    expect(refresh.request.body).toEqual({ refresh: 'refresh' });
    expect(refresh.request.headers.has('Authorization')).toBe(false);
    refresh.flush({ access: 'renewed' });
    for (const path of ['/private/1/', '/private/2/']) {
      const retry = backend.expectOne(base + path);
      expect(retry.request.headers.get('Authorization')).toBe('Bearer renewed');
      retry.flush({});
    }
  });

  it('clears the session when refresh fails', () => {
    login();
    privateRequest('/private/').subscribe({ error: () => {} });
    backend.expectOne(base + '/private/').flush({}, { status: 401, statusText: 'Unauthorized' });
    backend.expectOne(base + '/auth/refresh/').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.isAuthenticated()).toBe(false);
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/login'], { queryParams: { expired: '1' } });
  });

  it('does not restore a session after logout during refresh', () => {
    login();
    auth.refresh().subscribe({ error: () => {} });
    auth.logout();
    backend.expectOne(base + '/auth/refresh/').flush({ access: 'late-token' });
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.accessToken()).toBeNull();
  });

  it('does not refresh again when the retried request returns 401', () => {
    login();
    privateRequest('/private/').subscribe({ error: () => {} });
    backend.expectOne(base + '/private/').flush({}, { status: 401, statusText: 'Unauthorized' });
    backend.expectOne(base + '/auth/refresh/').flush({ access: 'renewed' });
    backend.expectOne(base + '/private/').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('redirects an anonymous guard and accepts a signed-in session', () => {
    const guard = () => TestBed.runInInjectionContext(() => authGuard({} as never, { url: '/private' } as never));
    expect(String(guard())).toBe('/login?returnUrl=%2Fprivate');
    login();
    expect(guard()).toBe(true);
  });

  it('shows invalid credentials and clears the password', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.componentInstance.form.setValue({ username: 'usuario', password: 'invalid' });
    fixture.componentInstance.submit();
    backend.expectOne(base + '/auth/login/').flush({}, { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Usuário ou senha inválidos');
    expect(fixture.componentInstance.form.controls.password.value).toBe('');
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('submits the login form and returns to home', async () => {
    const navigation = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(LoginComponent);
    await fixture.whenStable();
    for (const [selector, value] of [['#username', 'usuario'], ['#password', 'senha']]) {
      const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    backend.expectOne(base + '/auth/login/').flush({ access: 'access', refresh: 'refresh' });
    await fixture.whenStable();
    expect(auth.isAuthenticated()).toBe(true);
    expect(navigation).toHaveBeenCalledWith('/home');
  });

  it('reports missing fields and network errors without a session', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.componentInstance.submit();
    backend.expectNone(base + '/auth/login/');
    expect(fixture.componentInstance.error()).toContain('Preencha');
    fixture.componentInstance.form.setValue({ username: 'usuario', password: 'senha' });
    fixture.componentInstance.submit();
    backend.expectOne(base + '/auth/login/').error(new ProgressEvent('error'));
    expect(fixture.componentInstance.error()).toContain('Não foi possível conectar');
    expect(fixture.componentInstance.loading()).toBe(false);
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('never sends credentials to another origin even for an opted-in request', () => {
    login();
    http.get('https://example.org/private/', {
      context: new HttpContext().set(REQUIRE_AUTH, true),
    }).subscribe();
    const request = backend.expectOne('https://example.org/private/');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });
});
