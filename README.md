# ACESSA+

Frontend web do projeto ACESSA+ para consulta de locais e informações de acessibilidade em Sorocaba.

## Autenticação JWT

- Acesse `/login` ou use **Entrar** na página inicial com um usuário Django existente.
- O login usa `POST /api/auth/login/`; a renovação usa `POST /api/auth/refresh/`.
- A URL padrão é `http://127.0.0.1:8000/api`, definida em `src/app/auth/api.config.ts`. Ajuste o provider `API_BASE_URL` para o ambiente de publicação.
- Inicie o backend na porta 8000 e o frontend com `npm start`. O backend deve permitir a origem do frontend em `CORS_ALLOWED_ORIGINS`.
- Tokens ficam apenas em memória: recarregar ou fechar a página encerra a sessão local. Não são gravados em localStorage ou sessionStorage.
- **Sair** limpa a sessão local; o backend atual não revoga tokens.
- Consultas públicas não recebem tokens. Para uma futura chamada privada à API configurada, use `context: new HttpContext().set(REQUIRE_AUTH, true)`, importando `HttpContext` de `@angular/common/http` e `REQUIRE_AUTH` de `auth/auth.interceptor`.
- Chamadas privadas com HTTP 401 compartilham uma renovação e são repetidas uma única vez. Falha na renovação encerra a sessão e solicita novo login.
- Para futuras rotas privadas, use `canActivate: [authGuard]`. As rotas atuais continuam públicas. O backend também deve exigir autenticação nessas futuras views.
- Cadastro, recuperação de senha, perfil e mapa não são implementados nesta integração.

Execute `npx ng test --watch=false --include=src/app/auth/auth.spec.ts` para os testes de autenticação e `npm run build` para compilar.

## Rotas acessíveis (demonstração)

- Acesse `/rotas` ou **Rotas** na home. Não requer login ou backend.
- Informe origem e destino diferentes e pressione **Comparar rotas**. A rota mais acessível inicia selecionada; clique na outra opção ou use Tab e as setas nos botões de opção para alternar o trajeto no mapa.
- Os dados novos estão centralizados em `src/app/rotas/rotas.mock.ts`: tempos, distâncias, scores, barreiras e traçados SVG fixos. Qualquer par de nomes diferentes utiliza a mesma demonstração; não há busca de endereços ou cálculo geográfico.
- Campos vazios (inclusive espaços) exibem validação. Nomes iguais, desconsiderando espaços nas extremidades e maiúsculas, exibem o estado sem trajeto. Editar qualquer campo limpa a comparação anterior.
- O mapa é um esquema ilustrativo sem escala e sem serviços externos. O layout usa duas colunas em desktop e uma coluna em telas de até 800 px.
- Integração futura: definir contrato da API, substituir a fonte mockada, tratar carregamento/falhas/resultados vazios do serviço e conectar a geometria real a um mapa. O SVG atual não deve ser interpretado como coordenadas geográficas.
- Validação: `npm test -- --watch=false` e `npm run build`. Não há script de lint configurado.

## Tecnologias

- Angular
- TypeScript
- Angular Router
- Angular HttpClient
- Bootstrap
- CSS

## Requisitos

- Node.js 24+
- npm 11+

## Instalação

```bash
npm install
```

## Executar localmente

```bash
npm start
```

Por padrão, a aplicação sobe em `http://localhost:4200/`.

## Build

```bash
npm run build
```

## Configuração da API

A URL base da API está preparada em `src/environments/environment*.ts` com o valor:

```ts
apiUrl: 'http://localhost:8000/api'
```
