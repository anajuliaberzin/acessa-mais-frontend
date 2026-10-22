import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from './auth.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="signup-page">
      <section class="surface" aria-labelledby="signup-title">
        <span class="signup-icon"><i class="bi bi-person-plus" aria-hidden="true"></i></span>
        <h1 id="signup-title">Crie sua conta</h1>
        <p>Faça parte de uma Sorocaba mais acessível. Cadastre-se para reportar barreiras e acompanhar suas ocorrências.</p>
        <form [formGroup]="form" (ngSubmit)="submit()" [attr.aria-busy]="loading()" novalidate>
          <div><label for="signup-name">Nome</label><input id="signup-name" class="form-control" autocomplete="name" formControlName="nome" maxlength="150" required [attr.aria-invalid]="invalid('nome')" aria-describedby="error-nome" />@if (invalid('nome')) { <small id="error-nome">Informe seu nome (ao menos 2 caracteres).</small> }</div>
          <div><label for="signup-username">Usuário</label><input id="signup-username" class="form-control" autocomplete="username" formControlName="username" maxlength="150" required [attr.aria-invalid]="invalid('username')" aria-describedby="username-help error-username" /><p id="username-help" class="help">Este será seu identificador para entrar na plataforma.</p>@if (invalid('username')) { <small id="error-username">Informe um nome de usuário.</small> }</div>
          <div><label for="signup-email">E-mail</label><input id="signup-email" class="form-control" type="email" autocomplete="email" formControlName="email" maxlength="254" required [attr.aria-invalid]="invalid('email')" aria-describedby="error-email" />@if (invalid('email')) { <small id="error-email">Informe um e-mail válido.</small> }</div>
          <div><label for="signup-password">Senha</label><input id="signup-password" class="form-control" type="password" autocomplete="new-password" formControlName="password" maxlength="128" required [attr.aria-invalid]="invalid('password')" aria-describedby="password-help error-password" /><p id="password-help" class="help">Use pelo menos 8 caracteres. Evite senhas comuns, apenas números ou dados pessoais.</p>@if (invalid('password')) { <small id="error-password">A senha deve ter entre 8 e 128 caracteres.</small> }</div>
          <div><label for="signup-confirm">Confirmar senha</label><input id="signup-confirm" class="form-control" type="password" autocomplete="new-password" formControlName="password_confirmation" maxlength="128" required [attr.aria-invalid]="invalid('password_confirmation') || mismatch()" aria-describedby="error-confirm" />@if (invalid('password_confirmation') || mismatch()) { <small id="error-confirm">Confirme a mesma senha nos dois campos.</small> }</div>
          @if (error()) { <div class="alert alert-danger" role="alert">{{ error() }}</div> }
          <button class="primary-btn" type="submit" [disabled]="loading()">{{ loading() ? 'Criando conta…' : 'Criar conta' }}<i class="bi bi-arrow-right" aria-hidden="true"></i></button>
        </form>
        <p class="signin-link">Já tem uma conta? <a routerLink="/login" [queryParams]="{returnUrl: returnUrl}">Entrar</a></p>
        <a class="explore-link" routerLink="/explorar">Continuar explorando sem entrar</a>
      </section>
    </main>`,
  styles: [`
    .signup-page{min-height:calc(100vh - 73px);padding:40px 20px 64px;background:radial-gradient(ellipse at 20% 0,#eeecfb,transparent 60%);display:flex;justify-content:center;align-items:start}
    section{width:100%;max-width:520px;padding:32px}.signup-icon{display:grid;place-items:center;width:48px;height:48px;border-radius:16px;background:var(--soft);color:var(--primary);font-size:24px;margin-bottom:20px}h1{font-size:28px;margin-bottom:12px}section>p{font-size:13px}form{display:grid;gap:18px;margin:24px 0}label{display:block;font-size:13px;font-weight:600;margin-bottom:7px}.help{font-size:11px;margin:6px 0 0}small{display:block;color:#a21b2d;font-size:12px;margin-top:5px}.form-control[aria-invalid=true]{border-color:#b32632}.alert{font-size:12px;margin:0}.signin-link{text-align:center;margin:0 0 14px}.signin-link a{font-weight:700}.explore-link{display:block;text-align:center;font-size:12px;color:var(--muted)}@media(max-width:600px){.signup-page{padding:24px 16px}section{padding:24px}}
  `],
})
export class CadastroComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly returnUrl = inject(ActivatedRoute).snapshot.queryParamMap.get('returnUrl');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    username: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
    password_confirmation: ['', [Validators.required, Validators.maxLength(128)]],
  });
  invalid(field: keyof typeof this.form.controls) { const control = this.form.controls[field]; return control.touched && control.invalid; }
  mismatch() { return this.form.controls.password_confirmation.touched && this.form.controls.password.value !== this.form.controls.password_confirmation.value; }
  submit() {
    if (this.loading()) return;
    this.error.set(''); this.form.markAllAsTouched();
    if (this.form.invalid || this.mismatch()) return;
    this.loading.set(true);
    this.auth.register(this.form.getRawValue()).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false))).subscribe({
      next: () => { this.form.reset(); void this.router.navigate(['/login'], {queryParams:{registered:'1', returnUrl:this.returnUrl}}); },
      error: err => {
        if (err.status === 400 && err.error && typeof err.error === 'object') {
          const labels: Record<string,string> = {nome:'Nome',username:'Usuário',email:'E-mail',password:'Senha',password_confirmation:'Confirmação'};
          this.error.set(Object.entries(err.error).map(([key,value]) => `${labels[key] ?? 'Cadastro'}: ${Array.isArray(value) ? value.join(' ') : value}`).join(' '));
        } else this.error.set(err.status === 429 ? 'Muitas tentativas de cadastro. Tente novamente mais tarde.' : 'Não foi possível criar sua conta. Tente novamente.');
      },
    });
  }
}
