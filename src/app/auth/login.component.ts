import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="login-page">
      <section class="surface login-card" aria-labelledby="login-title">
        <a routerLink="/home" class="brand" aria-label="Acessa+, ir para o início">
          <span class="brand-mark"><i class="bi bi-universal-access" aria-hidden="true"></i></span>
          <span>Acessa<span class="brand-plus">+</span></span>
        </a>
        <div class="intro">
          <span class="eyebrow">Bem-vindo de volta</span>
          <h1 id="login-title">Entre na sua conta</h1>
          <p>Acesse seu perfil e acompanhe suas contribuições pela cidade.</p>
        </div>
        @if (registered) {
          <p class="notice notice-success" role="status"><i class="bi bi-check-circle" aria-hidden="true"></i>Conta criada! Entre com seu usuário e senha.</p>
        }
        @if (expired) {
          <p class="notice notice-info" role="status"><i class="bi bi-clock-history" aria-hidden="true"></i>Sua sessão expirou. Entre novamente.</p>
        }
        <form [formGroup]="form" (ngSubmit)="submit()" [attr.aria-busy]="loading()">
          <div class="field">
            <label for="username">Usuário</label>
            <div class="input-wrap">
              <i class="bi bi-person" aria-hidden="true"></i>
              <input id="username" class="form-control" autocomplete="username" formControlName="username"
                [attr.aria-invalid]="form.controls.username.touched && form.controls.username.invalid"
                [attr.aria-describedby]="error() ? 'login-error' : null" required />
            </div>
          </div>
          <div class="field">
            <label for="password">Senha</label>
            <div class="input-wrap">
              <i class="bi bi-lock" aria-hidden="true"></i>
              <input id="password" class="form-control" type="password" autocomplete="current-password"
                formControlName="password"
                [attr.aria-invalid]="form.controls.password.touched && form.controls.password.invalid"
                [attr.aria-describedby]="error() ? 'login-error' : null" required />
            </div>
          </div>
          @if (error()) { <p id="login-error" class="notice notice-error" role="alert"><i class="bi bi-exclamation-circle" aria-hidden="true"></i>{{ error() }}</p> }
          <button class="primary-btn submit-btn" type="submit" [disabled]="loading()">
            {{ loading() ? 'Entrando…' : 'Entrar' }}
            @if (!loading()) { <i class="bi bi-arrow-right" aria-hidden="true"></i> }
          </button>
        </form>
        <div class="account-prompt">
          <span>Ainda não tem conta?</span>
          <a routerLink="/cadastro" [queryParams]="{ returnUrl: returnUrl }">Criar conta</a>
        </div>
        <a class="explore-link" routerLink="/home">
          <i class="bi bi-compass" aria-hidden="true"></i>
          Continuar explorando sem entrar
        </a>
      </section>
    </main>
  `,
  styles: [`
    .login-page { min-height: calc(100vh - 73px); display: grid; place-items: center; padding: 40px 20px 64px;
      background: radial-gradient(ellipse at 50% 0, #eeecfb 0, transparent 62%); }
    .login-card { width: 100%; max-width: 448px; padding: 36px; border-radius: 28px; }
    .brand { display: inline-flex; align-items: center; gap: 10px; color: var(--ink); font-size: 1.125rem;
      font-weight: 800; letter-spacing: -0.04em; text-decoration: none; }
    .brand-mark { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 13px;
      background: var(--soft); color: var(--primary); font-size: 1.25rem; }
    .brand-plus { color: var(--primary); }
    .intro { margin-top: 30px; }
    .eyebrow { color: var(--primary); font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.09em;
      text-transform: uppercase; }
    h1 { margin: 7px 0 8px; font-size: 1.75rem; }
    .intro p { margin: 0; font-size: 0.8125rem; line-height: 1.6; }
    form { display: grid; gap: 18px; margin: 26px 0 20px; }
    .field { display: grid; gap: 7px; }
    label { font-size: 0.8125rem; font-weight: 600; }
    .input-wrap { position: relative; }
    .input-wrap > i { position: absolute; top: 50%; left: 15px; z-index: 1; color: var(--muted);
      font-size: 1rem; transform: translateY(-50%); pointer-events: none; }
    .input-wrap .form-control { min-height: 50px; padding-left: 44px; border-radius: 15px; }
    .input-wrap .form-control[aria-invalid='true'] { border-color: #b32632; }
    .submit-btn { width: 100%; min-height: 50px; margin-top: 2px; }
    .notice { display: flex; align-items: flex-start; gap: 9px; margin: 18px 0 0; padding: 12px 14px;
      border: 1px solid transparent; border-radius: 14px; font-size: 0.75rem; line-height: 1.5; }
    .notice i { flex: 0 0 auto; margin-top: 1px; }
    .notice-success { border-color: #b9e2d0; background: #eff9f4; color: #176b4a; }
    .notice-info { border-color: #d7d9f6; background: #f4f4ff; color: #4744a7; }
    .notice-error { border-color: #f0c4c6; background: #fff4f4; color: #a21b2d; }
    .account-prompt { display: flex; justify-content: center; flex-wrap: wrap; gap: 5px;
      color: var(--muted); font-size: 0.75rem; }
    .account-prompt a { font-weight: 700; }
    .explore-link { display: flex; align-items: center; justify-content: center; gap: 7px; margin-top: 18px;
      padding-top: 16px; border-top: 1px solid var(--line); color: var(--muted); font-size: 0.75rem;
      text-decoration: none; }
    .explore-link:hover { color: var(--primary); }
    @media (max-width: 480px) {
      .login-page { min-height: calc(100vh - 73px); padding: 24px 16px 48px; }
      .login-card { padding: 26px 22px; border-radius: 24px; }
      .intro { margin-top: 24px; }
    }
  `],
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly expired = this.route.snapshot.queryParamMap.get('expired') === '1';
  readonly registered = this.route.snapshot.queryParamMap.get('registered') === '1';
  readonly returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit() {
    if (this.loading()) return;
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      setTimeout(() => document.querySelector<HTMLElement>('[formControlName].ng-invalid')?.focus());
      this.error.set('Preencha o usuário e a senha.');
      return;
    }
    this.loading.set(true);
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: () => {
        const destination = this.route.snapshot.queryParamMap.get('returnUrl');
        void this.router.navigateByUrl(destination?.startsWith('/') &&
          !destination.startsWith('//') && !destination.startsWith('/login') ? destination : '/home');
      },
      error: (error: HttpErrorResponse) => {
        this.form.controls.password.reset();
        this.error.set(error.status === 401 ? 'Usuário ou senha inválidos.' :
          error.status === 0 ? 'Não foi possível conectar. Verifique sua conexão e tente novamente.' :
          'Não foi possível entrar. Tente novamente.');
      },
    });
  }
}
