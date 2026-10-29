import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Local, PlataformaService, RECURSOS } from '../services/plataforma.service';

@Component({
  imports: [FormsModule, RouterLink],
  template: `
    <main class="container py-5" style="max-width: 900px">
      <a routerLink="/painel">Voltar ao painel</a>
      <h1 class="mt-3">Cadastrar local</h1>
      <p>Adicione um estabelecimento de Sorocaba/SP. A nota será calculada pelos recursos informados.</p>
      @if (criado(); as local) {
        <div class="alert alert-success" role="status">
          <strong>{{ local.nome }} cadastrado!</strong>
          @if (local.acessibilidade.nota !== null) { <p>Nota de acessibilidade: {{ local.acessibilidade.nota }}/100.</p> }
          @else { <p>A nota ficará disponível quando os seis critérios estiverem preenchidos.</p> }
          <a routerLink="/explorar">Ver locais no mapa</a>
          <button type="button" class="btn btn-outline-success ms-3" (click)="novo(form)">Cadastrar outro</button>
        </div>
      }
      <form #form="ngForm" (ngSubmit)="salvar(form)" class="card p-4 mt-4" [attr.aria-busy]="salvando()">
        <fieldset [disabled]="salvando() || !!criado()">
          <legend class="h4">Informações do local</legend>
          <div class="row g-3">
            <label class="col-md-8">Nome *<input class="form-control" name="nome" [(ngModel)]="dados.nome" required maxlength="255"></label>
            <label class="col-md-4">Categoria *<input class="form-control" name="categoria" [(ngModel)]="dados.categoria" required maxlength="100" placeholder="Ex.: restaurante"></label>
            <label class="col-12">Endereço completo *<input class="form-control" name="endereco" [(ngModel)]="dados.endereco" required maxlength="255"></label>
            <label class="col-12">Descrição<textarea class="form-control" name="descricao" [(ngModel)]="dados.descricao" rows="3"></textarea></label>
            <p class="mb-0">Cidade: Sorocaba · Estado: SP</p>
            <label class="col-md-6">Latitude *<input class="form-control" type="number" name="latitude" [(ngModel)]="dados.latitude" required min="-90" max="90" step="0.000001" placeholder="-23.501500"></label>
            <label class="col-md-6">Longitude *<input class="form-control" type="number" name="longitude" [(ngModel)]="dados.longitude" required min="-180" max="180" step="0.000001" placeholder="-47.452600"></label>
          </div>
          <fieldset class="mt-4">
            <legend class="h4">Recursos de acessibilidade</legend>
            <p>Selecione “Não informado” quando o recurso ainda não foi verificado.</p>
            <div class="row g-3">
              @for (recurso of recursos; track recurso.chave) {
                <label class="col-md-6">{{ recurso.rotulo }}
                  <select class="form-select" [name]="recurso.chave" [(ngModel)]="dados.recursos[recurso.chave]">
                    <option value="nao_informado">Não informado</option>
                    <option value="atendido">Atendido</option>
                    <option value="nao_atendido">Não atendido</option>
                    <option value="nao_aplicavel">Não aplicável</option>
                  </select>
                </label>
              }
            </div>
          </fieldset>
          <label class="d-flex gap-2 mt-4"><input type="checkbox" name="confirmacao" [(ngModel)]="dados.localizacao_confirmada" required>Confirmo que o endereço e as coordenadas pertencem a Sorocaba/SP. *</label>
          @if (form.submitted && form.invalid) { <p class="text-danger" role="alert">Preencha os campos obrigatórios, confira as coordenadas e confirme a localização.</p> }
          @if (erro()) { <p class="alert alert-danger mt-3" role="alert">{{ erro() }}</p> }
          <button class="btn btn-primary mt-3" type="submit">{{ salvando() ? 'Salvando…' : 'Cadastrar local' }}</button>
        </fieldset>
      </form>
    </main>`,
})
export class CadastrarLocalComponent {
  private readonly api = inject(PlataformaService);
  readonly recursos = Object.entries(RECURSOS).map(([chave, rotulo]) => ({ chave, rotulo }));
  readonly salvando = signal(false);
  readonly erro = signal('');
  readonly criado = signal<Local | null>(null);
  dados = this.vazio();
  private vazio() {
    return { nome: '', categoria: '', endereco: '', descricao: '', cidade: 'Sorocaba', estado: 'SP',
      latitude: null as number | null, longitude: null as number | null, localizacao_confirmada: false,
      recursos: Object.fromEntries(Object.keys(RECURSOS).map(r => [r, 'nao_informado'])) };
  }
  novo(form: NgForm) {
    this.dados = this.vazio();
    form.resetForm({ ...this.dados, ...this.dados.recursos, confirmacao: false });
    this.criado.set(null);
    this.erro.set('');
  }
  salvar(form: NgForm) {
    if (this.salvando() || this.criado()) return;
    if (form.invalid) { form.control.markAllAsTouched(); return; }
    this.salvando.set(true);
    this.erro.set('');
    this.api.criarLocal(this.dados).subscribe({
      next: local => { this.criado.set(local); this.salvando.set(false); },
      error: e => {
        this.salvando.set(false);
        this.erro.set(e.status === 403 ? 'Somente superadministradores podem cadastrar locais.' :
          e.status === 400 ? Object.entries(e.error ?? {}).map(([campo, mensagem]) => campo + ': ' + mensagem).join(' · ') :
          'Não foi possível salvar. Verifique sua conexão e tente novamente.');
      },
    });
  }
}
