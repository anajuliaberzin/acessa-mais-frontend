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
    <main>
      <section aria-labelledby="login-title">
        <a routerLink="/home" class="brand">Acessa+</a>
        <h1 id="login-title">Entre na sua conta</h1>
        <p>Você pode continuar explorando os locais sem entrar.</p>
        @if (expired) { <p role="status">Sua sessão expirou. Entre novamente.</p> }
        <form [formGroup]="form" (ngSubmit)="submit()" [attr.aria-busy]="loading()">
          <label for="username">Usuário</label>
          <input id="username" autocomplete="username" formControlName="username" required />
          <label for="password">Senha</label>
          <input id="password" type="password" autocomplete="current-password"
            formControlName="password" required />
          @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'Entrando…' : 'Entrar' }}
          </button>
        </form>
        <a routerLink="/home">Continuar sem entrar</a>
      </section>
    </main>
  `,
  styles: [`
    main { min-height: 100vh; display: grid; place-items: center; padding: 24px; color: #1a2340; }
    section { width: 100%; max-width: 440px; padding: 32px; border-radius: 24px;
      background: white; box-shadow: 0 14px 40px #1b254012; }
    .brand { font-size: 1.4rem; font-weight: 800; text-decoration: none; }
    h1 { font-size: 1.8rem; margin-top: 28px; }
    p { line-height: 1.5; }
    form { display: grid; gap: 12px; margin: 24px 0; }
    label { font-weight: 600; }
    input { width: 100%; padding: 12px; border: 1px solid #727c96; border-radius: 10px; }
    button { padding: 14px; border: 0; border-radius: 12px; background: #4f5de1;
      color: white; font-weight: 700; cursor: pointer; }
    button:disabled { opacity: .65; cursor: wait; }
    a { color: #404ec4; }
    .error { color: #a21b2d; margin: 0; }
    :focus-visible { outline: 3px solid #4f5de1; outline-offset: 3px; }
  `],
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly expired = this.route.snapshot.queryParamMap.get('expired') === '1';
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
