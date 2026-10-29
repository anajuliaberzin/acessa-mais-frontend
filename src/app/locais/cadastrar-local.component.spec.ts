import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CadastrarLocalComponent } from './cadastrar-local.component';
import { REQUIRE_AUTH } from '../auth/auth.interceptor';

describe('Cadastro de local', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [
    provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
  ] }));
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('exige autenticação na requisição, impede envio duplo e apresenta sucesso', () => {
    const c = TestBed.createComponent(CadastrarLocalComponent).componentInstance;
    const form = { invalid: false } as NgForm;
    c.dados.nome = 'Café teste';
    c.salvar(form);
    c.salvar(form);
    const req = TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/gestao/locais/'));
    expect(req.request.context.get(REQUIRE_AUTH)).toBe(true);
    expect(req.request.body.recursos.rampa).toBe('nao_informado');
    req.flush({ id: 1, nome: 'Café teste', acessibilidade: { nota: null } });
    expect(c.criado()?.id).toBe(1);
    expect(c.salvando()).toBe(false);
  });

  it('preserva os dados quando o servidor recusa a operação', () => {
    const c = TestBed.createComponent(CadastrarLocalComponent).componentInstance;
    c.dados.nome = 'Café teste';
    c.salvar({ invalid: false } as NgForm);
    TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/gestao/locais/'))
      .flush({}, { status: 403, statusText: 'Forbidden' });
    expect(c.erro()).toContain('superadministradores');
    expect(c.dados.nome).toBe('Café teste');
    expect(c.salvando()).toBe(false);
  });
});
