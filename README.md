# ACESSA+

Frontend web do projeto ACESSA+ para consulta de locais e informações de acessibilidade em Sorocaba.

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
