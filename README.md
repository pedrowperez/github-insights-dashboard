# GitHub Insights Dashboard

Aplicacao web full stack com **sistema de autenticacao** e um **dashboard protegido** que consome e visualiza dados da API publica do GitHub. O usuario pode se cadastrar, fazer login e explorar dados de **usuarios** e **repositorios** do GitHub por meio de graficos e cards interativos.

> Teste Tecnico - Desenvolvedor Full Stack | Tendencias Consultoria

---

## Dados de contato

- **Nome:** Pedro Perez
- **E-mail:** pedrowperez@gmail.com
- **LinkedIn:** [pedro-perezf](https://www.linkedin.com/in/pedro-perezf/)
- **GitHub:** [@pedrowperez](https://github.com/pedrowperez)

---

## Tecnologias utilizadas e justificativas

### Frontend
| Tecnologia | Justificativa |
|------------|---------------|
| **React 18 + Vite + TypeScript** | React e obrigatorio no desafio. Vite oferece dev server rapido e build otimizado. TypeScript traz seguranca de tipos de ponta a ponta. |
| **React Router** | Roteamento declarativo com rotas protegidas (`ProtectedRoute`). |
| **TanStack React Query** | Gerencia cache, estados de loading/erro e revalidacao das chamadas a API de forma robusta, evitando boilerplate. |
| **Recharts** | Biblioteca de graficos declarativa e responsiva (pizza e barras) para visualizar linguagens e metricas de repositorios. |
| **Tailwind CSS** | Estilizacao utilitaria, rapida e responsiva, com design system centralizado (tokens de cor, tipografia e componentes). |
| **Axios** | Cliente HTTP com interceptors para injecao automatica do token JWT e tratamento global de 401. |
| **Vitest + Testing Library** | Testes de unidade e de componentes do frontend, com ambiente jsdom. |

### Backend
| Tecnologia | Justificativa |
|------------|---------------|
| **NestJS (Node.js + TypeScript)** | Arquitetura modular, opinada e escalavel (modules, controllers, services, guards), facilitando organizacao e testes. |
| **TypeORM + PostgreSQL** | ORM maduro integrado ao Nest; PostgreSQL e um banco relacional robusto, hospedado gratuitamente na nuvem (Neon/Supabase). |
| **Passport + JWT** | Estrategia de autenticacao stateless padrao de mercado, com guard reutilizavel para proteger rotas. |
| **bcryptjs** | Hash seguro de senhas (implementacao pura em JS, sem dependencia de build nativo). |
| **@nestjs/axios** | Proxy server-side para a API do GitHub, centralizando tratamento de erros, rate limit e cache. |
| **@nestjs/cache-manager** | Cache em memoria das respostas do GitHub, reduzindo chamadas e atenuando o rate limit. |
| **Helmet + Throttler + class-validator** | Camadas de seguranca: headers HTTP seguros, rate limiting e validacao/sanitizacao de entrada. |
| **@nestjs/swagger** | Documentacao interativa da API (OpenAPI) disponivel em `/api/docs`. |
| **Jest** | Testes de unidade dos services e controllers do backend. |

### Infra
| Tecnologia | Justificativa |
|------------|---------------|
| **Docker + Docker Compose** | Empacotamento e orquestracao de backend, frontend (Nginx) e PostgreSQL com um unico comando. |
| **GitHub Actions** | Pipeline de CI: build, testes e build das imagens Docker a cada push/PR. |

---

## Descricao da solucao

A aplicacao responde a pergunta _"como interpretar um dashboard de dados do GitHub?"_ oferecendo **duas perspectivas complementares** em abas separadas:

### Aba Usuarios
- Busca de usuarios por nome de login.
- Card de perfil (avatar, bio, empresa, localizacao, seguidores/seguindo).
- Cards de estatisticas agregadas: total de stars somadas, total de forks, repos publicos e repos analisados.
- **Grafico de pizza** com as linguagens mais usadas pelo usuario (derivado dos repositorios).
- **Grafico de barras** comparando stars x forks dos principais repositorios.
- Lista de repositorios em destaque com link direto.

### Aba Repositorios
- Busca de repositorios com filtros por **linguagem** e **ordenacao** (stars, forks, atualizacao).
- **Grafico de barras** comparando stars, forks e issues abertas dos principais resultados.
- Grade de cards com descricao, linguagem e metricas, com link direto para o GitHub.

O backend nunca expoe a API do GitHub diretamente ao cliente: todas as chamadas passam pelo NestJS, que **agrega**, **trata erros** (404, rate limit, indisponibilidade) e **cacheia** os resultados. As rotas de dados sao protegidas por JWT, exigindo login.

---

## Arquitetura e decisoes tecnicas

```
.
|-- .github/workflows/       # Pipeline de CI (GitHub Actions)
|-- docker-compose.yml       # Postgres + backend + frontend
|-- backend/                 # API NestJS
|   |-- Dockerfile
|   `-- src/
|       |-- auth/            # Registro, login, JWT, guard, strategy, DTOs (+ .spec)
|       |-- users/           # Entidade User + repositorio (TypeORM)
|       |-- github/          # Proxy + agregacao da API do GitHub (protegido) (+ .spec)
|       |-- common/filters/  # Filtro global de excecoes
|       |-- app.module.ts
|       `-- main.ts          # Bootstrap + Swagger (/api/docs)
`-- frontend/                # SPA React + Vite
    |-- Dockerfile           # Build + Nginx
    |-- nginx.conf
    `-- src/
        |-- api/             # Cliente axios + interceptors (+ .test)
        |-- context/         # AuthContext (estado de autenticacao)
        |-- components/      # ProtectedRoute, abas, UI, graficos (+ .test)
        |-- pages/           # Login, Register, Dashboard (+ .test)
        |-- test/            # Setup do Vitest
        `-- types/           # Tipos compartilhados
```

### Fluxo de autenticacao

```mermaid
flowchart LR
  subgraph FE [Frontend React]
    Auth[Login / Registro]
    Dash[Dashboard protegido]
  end
  subgraph BE [Backend NestJS]
    Ctrl[AuthController]
    Guard[JwtAuthGuard]
    GH[GithubModule]
  end
  DB[(PostgreSQL)]
  GitHub[(api.github.com)]

  Auth -->|"POST /auth/register | /auth/login"| Ctrl
  Ctrl -->|bcrypt + persiste| DB
  Ctrl -->|access_token JWT| Auth
  Dash -->|Bearer token| Guard
  Guard --> GH
  GH -->|HTTP + cache| GitHub
```

### Decisoes principais
- **Backend como proxy do GitHub:** centraliza tratamento de erros, rate limit e cache, e evita expor logica/segredos ao cliente.
- **JWT stateless:** simples de escalar; o token e guardado no `localStorage` e injetado via interceptor do axios. Um handler global trata respostas `401` derrubando a sessao.
- **`synchronize: true` no TypeORM:** acelera o setup para o contexto do teste (cria as tabelas automaticamente). Em producao real, o recomendado seria usar migrations versionadas.
- **Cache em memoria das respostas do GitHub** (TTL ~60s) para reduzir chamadas repetidas e o risco de atingir o rate limit (60 req/h sem token).
- **Validacao e seguranca:** `ValidationPipe` global com whitelist, `helmet`, CORS restrito ao frontend e rate limiting com `@nestjs/throttler`.

### Endpoints principais
| Metodo | Rota | Protegida | Descricao |
|--------|------|-----------|-----------|
| POST | `/api/auth/register` | Nao | Cria conta e retorna token |
| POST | `/api/auth/login` | Nao | Autentica e retorna token |
| GET | `/api/auth/me` | Sim | Dados do usuario logado |
| GET | `/api/github/users/search?q=` | Sim | Busca usuarios |
| GET | `/api/github/users/:username` | Sim | Perfil + agregacoes (linguagens, stars, top repos) |
| GET | `/api/github/repos/search?q=&language=&sort=` | Sim | Busca repositorios |
| GET | `/api/github/repos/:owner/:repo` | Sim | Detalhe de um repositorio |

A documentacao interativa (Swagger / OpenAPI) fica disponivel em **`/api/docs`** com o backend rodando.

---

## Instrucoes de instalacao e execucao

### Opcao A - Docker Compose (mais simples)

Sobe PostgreSQL, backend e frontend de uma vez. Requer Docker instalado.

```bash
docker compose up --build
```

- Frontend: `http://localhost:8080`
- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`

As variaveis de ambiente ja vem definidas no `docker-compose.yml` (incluindo um PostgreSQL local, sem necessidade de banco na nuvem). Ajuste o `JWT_SECRET` e, se quiser, informe um `GITHUB_TOKEN`.

### Opcao B - Execucao manual

#### Pre-requisitos
- **Node.js 18+** (testado com Node 24) e npm.
- Uma instancia de **PostgreSQL**. A forma mais rapida e gratuita e criar um banco na nuvem:
  - **Neon** (https://neon.tech) ou **Supabase** (https://supabase.com) -> crie um projeto e copie a **connection string** (`DATABASE_URL`).

#### 1. Backend
```bash
cd backend
npm install
cp .env.example .env   # no Windows (PowerShell): Copy-Item .env.example .env
```
Edite o arquivo `backend/.env` e preencha:
```env
DATABASE_URL=postgresql://usuario:senha@host:5432/dbname?sslmode=require
DB_SSL=true           # 'true' para Neon/Supabase; 'false' para Postgres local
JWT_SECRET=uma-string-aleatoria-bem-longa
JWT_EXPIRES_IN=1h
CLIENT_URL=http://localhost:5173
GITHUB_TOKEN=        # opcional, aumenta o rate limit para 5000 req/h
PORT=3000
```
Inicie a API:
```bash
npm run start:dev
```
A API sobe em `http://localhost:3000/api` (Swagger em `/api/docs`) e cria as tabelas automaticamente.

#### 2. Frontend
Em outro terminal:
```bash
cd frontend
npm install
cp .env.example .env   # no Windows (PowerShell): Copy-Item .env.example .env
npm run dev
```
O frontend sobe em `http://localhost:5173`.

#### 3. Usando
1. Acesse o frontend (`http://localhost:5173` no modo manual ou `http://localhost:8080` via Docker).
2. Crie uma conta em **Cadastre-se**.
3. Voce sera redirecionado para o **dashboard protegido**.
4. Explore as abas **Usuarios** e **Repositorios**.

---

## Testes

```bash
# Backend (Jest) - services e controllers
cd backend && npm test

# Frontend (Vitest + Testing Library) - utils e componentes
cd frontend && npm test
```

Cobertura: `npm run test:cov` em cada projeto.

- **Backend:** testes de unidade do `AuthService` (registro/login, hash de senha, conflitos e credenciais invalidas), do `GithubService` (mapeamento e agregacao de dados, tratamento de erro 404) e do `AuthController`.
- **Frontend:** testes de utilitarios (`formatNumber`, `extractErrorMessage`) e de componentes (`StatCard`, `EmptyState`, pagina de `Login`).

## CI/CD

Pipeline em **GitHub Actions** ([.github/workflows/ci.yml](.github/workflows/ci.yml)) executado a cada push/PR na `main`, com tres jobs:
1. **Backend** - `npm ci`, `npm run build`, `npm test`.
2. **Frontend** - `npm ci`, `npm test`, `npm run build`.
3. **Docker** - build das imagens do backend e do frontend para validar os Dockerfiles.

## Docker

- `backend/Dockerfile` - build multi-stage (Node) servindo a API com apenas as dependencias de producao.
- `frontend/Dockerfile` - build do Vite e publicacao estatica via **Nginx** (com SPA fallback).
- `docker-compose.yml` - orquestra PostgreSQL + backend + frontend.

---

## Screenshots

> Adicione aqui as capturas de tela da aplicacao.

| Tela | Imagem |
|------|--------|
| Login | _[inserir screenshot]_ |
| Cadastro | _[inserir screenshot]_ |
| Dashboard - Usuarios | _[inserir screenshot]_ |
| Dashboard - Repositorios | _[inserir screenshot]_ |

---

## Possiveis melhorias futuras
- Testes e2e (ex.: Supertest com banco de testes, Playwright no frontend).
- Migrations versionadas (em vez de `synchronize: true`).
- Refresh token e logout no servidor.
- Paginacao nos resultados de busca.
- Deploy (ex.: backend no Render/Railway, frontend na Vercel).

---

## Licenca
MIT
