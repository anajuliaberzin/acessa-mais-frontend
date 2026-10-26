import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function api(page:Page){
  const local={id:1,nome:'Biblioteca municipal',categoria:'serviço público',endereco:'Centro, Sorocaba',descricao:'Biblioteca com entrada acessível.',latitude:-23.5,longitude:-47.45,recursos:{rampa:'atendido'},fotos:[],acessibilidade:{nota:80,classificacao:'boa acessibilidade'},media_avaliacoes:4,total_avaliacoes:1};
  const registro={id:1,protocolo:'AC-TESTE',endereco:'Rua da Penha, Sorocaba',descricao:'Calçada com obstáculo para passagem.',tipoProblema:'obstaculo_na_via',status:'em_analise',dataCriacao:'2026-10-22T10:00:00Z',fotoUrl:null,historico:[]};
  const pagina=(results:unknown[])=>({count:results.length,next:null,previous:null,results});
  await page.route('**/api/**',async route=>{
    const path=new URL(route.request().url()).pathname;
    let body:unknown={};
    if(path.endsWith('/auth/login/'))body={access:'test-token',refresh:'test-refresh'};
    else if(path.endsWith('/me/'))body={id:1,nome:'Maria de Teste',cidade:'Sorocaba',uf:'SP',membroDesde:'2026-01-01',preferencias:[],gestor:true};
    else if(path.endsWith('/me/avaliacoes/'))body=pagina([{id:1,nomeLocal:local.nome,nota:4,comentario:'Entrada sem degraus.',created_at:'2026-10-22'}]);
    else if(path.endsWith('/me/favoritos/'))body=pagina([local]);
    else if(path.endsWith('/locais/filtros/'))body={categorias:['serviço público']};
    else if(path.endsWith('/indicadores/'))body={total_ocorrencias:1,total_locais:1,locais_com_nota:1,locais_sem_nota:0,media_acessibilidade:80,por_status:[{status:'em_analise',total:1}],por_tipo:[{tipo_problema:'obstaculo_na_via',total:1}],evolucao:[{dia:'2026-10-22',total:1}],por_acessibilidade:[{classificacao:'boa acessibilidade',total:1}]};
    else if(path.endsWith('/ocorrencias/'))body=pagina([registro]);
    else if(path.endsWith('/enderecos/'))body={results:[{endereco:local.endereco,latitude:-23.5,longitude:-47.45}]};
    else body=pagina([local]);
    await route.fulfill({json:body});
  });
  await page.route('https://tile.openstreetmap.org/**',route=>route.abort());
}
async function login(page:Page){await page.goto('/login');await page.getByLabel('Usuário',{exact:true}).fill('maria');await page.getByLabel('Senha',{exact:true}).fill('test-password');await page.getByRole('button',{name:'Entrar',exact:true}).click();await expect(page).toHaveURL(/home/);}
async function audit(page:Page){
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  expect(result.violations.map(v=>({id:v.id,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([]);
}
test.beforeEach(async({page})=>api(page));
for(const path of ['home','explorar','rotas','login','cadastro','reportar','perfil','ocorrencias','painel']){
  test(path+' sem violações automatizadas no tema padrão e alto contraste',async({page})=>{
    if(['reportar','perfil','ocorrencias','painel'].includes(path))await login(page);
    await page.goto('/'+path);
    // Sessão é mantida em memória: navegação protegida deve ocorrer sem recarregar a aplicação.
    if(['reportar','perfil','ocorrencias','painel'].includes(path)){
      await login(page);
      if(path==='ocorrencias'){await page.getByRole('link',{name:'Perfil',exact:true}).click();await page.getByRole('button',{name:'Minhas ocorrências',exact:true}).click();await page.getByRole('link',{name:'Acompanhar protocolos e histórico'}).click();}
      else await page.getByRole('link',{name:({reportar:'Reportar',perfil:'Perfil',painel:'Admin'} as Record<string,string>)[path],exact:true}).click();
    }
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByText('Carregando…',{exact:true})).toHaveCount(0);
    await audit(page);
    await page.getByRole('button',{name:'Opções de acessibilidade'}).click();
    await page.getByRole('button',{name:/Alto contraste/}).click();
    await audit(page);
  });
}
test('preferências persistem, restauração é isolada e Escape devolve o foco',async({page})=>{
  await page.goto('/home');await page.evaluate(()=>localStorage.setItem('outra-configuracao','preservar'));
  const trigger=page.getByRole('button',{name:'Opções de acessibilidade'});await trigger.click();
  await page.getByRole('button',{name:'Aumentar fonte'}).click();await page.getByRole('button',{name:/Alto contraste/}).click();
  await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
  await page.reload();await expect(page.locator('html')).toHaveAttribute('data-contrast','high');
  await trigger.click();await expect(page.locator('output')).toHaveText('125%');await page.getByRole('button',{name:'Restaurar configurações padrão'}).click();
  await expect(page.locator('output')).toHaveText('100%');expect(await page.evaluate(()=>localStorage.getItem('outra-configuracao'))).toBe('preservar');
});
test('texto a 200% e viewport móvel sem transbordamento da página',async({page})=>{
  await page.setViewportSize({width:320,height:740});await page.goto('/home');
  await page.getByRole('button',{name:'Opções de acessibilidade'}).click();
  for(let n=0;n<4;n++)await page.getByRole('button',{name:'Aumentar fonte'}).click();
  await page.getByRole('button',{name:'Fechar opções de acessibilidade'}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1)).toBe(true);
});
