import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { CadastroComponent } from './cadastro.component';

describe('Criar conta', () => {
  beforeEach(() => TestBed.configureTestingModule({providers:[provideRouter([]),provideHttpClient(),provideHttpClientTesting()]}));
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  const dados = {nome:'Pessoa Teste', username:'pessoa', email:'pessoa@example.com', password:'Mosaico!72Verde', password_confirmation:'Mosaico!72Verde'};
  it('impede confirmação divergente e envio duplicado; redireciona ao login após criação', () => {
    const c = TestBed.createComponent(CadastroComponent).componentInstance;
    const router = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    c.form.setValue({...dados,password_confirmation:'outra'}); c.submit();
    TestBed.inject(HttpTestingController).expectNone(r => r.url.endsWith('/auth/register/'));
    c.form.setValue(dados); c.submit(); c.submit();
    const request = TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/auth/register/'));
    expect(request.request.body).toEqual(dados);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({id:1,username:'pessoa',email:dados.email});
    expect(router).toHaveBeenCalledWith(['/login'], {queryParams:{registered:'1',returnUrl:null}});
    expect(c.form.controls.password.value).toBe('');
  });
  it('exibe a validação do servidor e permite corrigir os dados', () => {
    const c = TestBed.createComponent(CadastroComponent).componentInstance;
    c.form.setValue(dados); c.submit();
    TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/auth/register/')).flush({username:['Já está em uso.']}, {status:400,statusText:'Bad Request'});
    expect(c.error()).toContain('Usuário: Já está em uso.');
    expect(c.loading()).toBe(false);
    expect(c.form.controls.nome.value).toBe(dados.nome);
  });
});
