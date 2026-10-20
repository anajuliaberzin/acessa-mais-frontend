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

## Rotas acessíveis (integradas ao backend)

- Acesse `/rotas`. A consulta é pública e envia `POST /api/rotas/comparar/` usando `API_BASE_URL`.
- Informe latitude e longitude de origem/destino em Sorocaba. Nesta etapa não há busca por endereço, geocodificação ou GPS.
- Configure `ROUTING_API_KEY` no `.env` **do backend** e reinicie o Django. A chave nunca é enviada pelo frontend nem incluída no bundle.
- Inicie o backend em `http://127.0.0.1:8000` e abra o frontend em `http://localhost:4200/rotas`. A origem precisa constar em `CORS_ALLOWED_ORIGINS` do backend.
- Tempos, distâncias, barreiras e geometria vêm da API. Não existe fallback para mocks; falhas de rede, validação, ausência de rota, indisponibilidade e timeout têm mensagens próprias.
- A rota rápida inicia selecionada. As demais são rotuladas como alternativas; `rota_acessivel: null` exibe a limitação. Score nulo é mostrado como “não avaliada”, nunca como zero.
- O SVG existente desenha as coordenadas GeoJSON recebidas em um enquadramento comum às opções. Não utiliza o antigo desenho fixo de ruas, não calcula rotas e ainda não possui mapa base/cartografia. Tab e setas permitem trocar a seleção.
- Editar coordenadas cancela requisições pendentes e limpa resultados. O layout adapta-se a uma coluna até 800 px.
- Testes: `npm test -- --watch=false`; build: `npm run build`. Os testes regulares mockam HTTP e não consomem quota externa.

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
