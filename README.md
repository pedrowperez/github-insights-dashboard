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
| **Playwright** | Testes e2e de navegador (smoke do fluxo de autenticacao e rotas protegidas). |

### Backend
| Tecnologia | Justificativa |
|------------|---------------|
| **NestJS (Node.js + TypeScript)** | Arquitetura modular, opinada e escalavel (modules, controllers, services, guards), facilitando organizacao e testes. |
| **TypeORM + PostgreSQL** | ORM maduro integrado ao Nest; PostgreSQL e um banco relacional robusto, hospedado gratuitamente na nuvem (Neon/Supabase). Schema versionado via **migrations**. |
| **Passport + JWT (access + refresh token)** | Autenticacao stateless com **access token** de vida curta e **refresh token** rotacionado e revogavel no servidor (logout real). |
| **bcryptjs** | Hash seguro de senhas (implementacao pura em JS, sem dependencia de build nativo). |
| **@nestjs/axios** | Proxy server-side para a API do GitHub, centralizando tratamento de erros, rate limit e cache. |
| **@nestjs/cache-manager** | Cache em memoria das respostas do GitHub, reduzindo chamadas e atenuando o rate limit. |
| **Helmet + Throttler + class-validator** | Camadas de seguranca: headers HTTP seguros, rate limiting e validacao/sanitizacao de entrada. |
| **@nestjs/swagger** | Documentacao interativa da API (OpenAPI) disponivel em `/api/docs`. |
| **Jest + Supertest** | Testes de unidade (services/controllers) e testes **e2e** do fluxo HTTP (auth + proxy). |

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

Ambas as buscas sao **paginadas** (navegacao por paginas, respeitando o limite de 1000 resultados da Search API do GitHub).

O backend nunca expoe a API do GitHub diretamente ao cliente: todas as chamadas passam pelo NestJS, que **agrega**, **trata erros** (404, rate limit, indisponibilidade) e **cacheia** os resultados. As rotas de dados sao protegidas por JWT, exigindo login. A sessao permanece ativa de forma transparente: ao expirar o access token, o cliente usa o **refresh token** automaticamente (com retry da requisicao).

---

## Visao do produto

Esta secao responde diretamente as perguntas propostas no desafio.

### Como interpreto um "dashboard de dados do GitHub"?
Mais do que um proxy que repassa respostas da API, entendo o dashboard como uma ferramenta de **exploracao e leitura rapida** de duas entidades centrais do GitHub: **pessoas (devs/orgs)** e **projetos (repositorios)**. Em vez de mostrar JSON cru, o objetivo e responder perguntas em poucos segundos: _"que tecnologias esse dev domina?"_, _"qual o alcance do trabalho dele?"_, _"quais projetos lideram um tema e como se comparam?"_. Por isso optei por **duas abas** com propositos distintos, mas mesma linguagem visual.

### Quais informacoes considero relevantes?
- **Perfil do usuario:** identidade (avatar, nome, bio, empresa, localizacao) + alcance social (seguidores). Sao o contexto humano.
- **Metricas agregadas do usuario:** somatorio de **stars** e **forks** de todos os repositorios, total de repos publicos e analisados. Traduzem "reputacao e volume" em numeros unicos e comparaveis.
- **Distribuicao de linguagens:** revela a stack real do dev a partir dos repositorios (nao apenas o que ele declara).
- **Top repositorios:** os projetos mais relevantes (por stars), que contam a "historia" principal daquele perfil.
- **Comparativo de repositorios (busca):** stars, forks e issues abertas lado a lado, permitindo avaliar **popularidade vs. manutencao vs. carga de trabalho** entre projetos de um mesmo tema.

### Como apresento de forma util e visual?
- **Hierarquia de leitura:** cards de KPI no topo (numero grande), depois graficos, depois listas com link para o GitHub — do resumo ao detalhe.
- **Grafico certo para cada dado:** **pizza/donut** para proporcao (linguagens) e **barras** para comparacao (stars/forks/issues entre repos).
- **Cor com significado:** paleta consistente onde cada metrica tem sempre a mesma cor (stars, forks, issues), reduzindo carga cognitiva.
- **Resposta rapida e tolerante a erro:** chips de sugestao para comecar sem digitar, skeleton loaders durante o carregamento, estados vazios claros e mensagens amigaveis (incluindo aviso especifico de rate limit do GitHub).

---

## Arquitetura e decisoes tecnicas

```
.
|-- .github/workflows/       # Pipeline de CI (GitHub Actions)
|-- docker-compose.yml       # Postgres + backend + frontend
|-- backend/                 # API NestJS
|   |-- Dockerfile
|   |-- test/               # Testes e2e (Supertest) com fakes em memoria
|   `-- src/
|       |-- auth/            # Login, JWT, refresh token (entity + endpoints), guard, DTOs (+ .spec)
|       |-- users/           # Entidade User + repositorio (TypeORM)
|       |-- github/          # Proxy + agregacao da API do GitHub (protegido, paginado) (+ .spec)
|       |-- migrations/      # Migrations versionadas (schema)
|       |-- common/filters/  # Filtro global de excecoes
|       |-- data-source.ts   # DataSource do TypeORM (CLI de migrations)
|       |-- app.module.ts
|       `-- main.ts          # Bootstrap + Swagger (/api/docs)
`-- frontend/                # SPA React + Vite
    |-- Dockerfile           # Build + Nginx
    |-- nginx.conf
    |-- playwright.config.ts # Config dos testes e2e
    |-- e2e/                 # Testes e2e (Playwright)
    `-- src/
        |-- api/             # Cliente axios + interceptors (refresh automatico) (+ .test)
        |-- context/         # AuthContext (estado de autenticacao)
        |-- components/      # ProtectedRoute, abas, UI, graficos, paginacao (+ .test)
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
  Ctrl -->|access + refresh token| Auth
  Auth -.->|"POST /auth/refresh (no 401)"| Ctrl
  Dash -->|Bearer access token| Guard
  Guard --> GH
  GH -->|HTTP + cache| GitHub
```

### Decisoes principais
- **Backend como proxy do GitHub:** centraliza tratamento de erros, rate limit e cache, e evita expor logica/segredos ao cliente.
- **Access + refresh token:** o **access token** (JWT, vida curta ~15min) e injetado via interceptor do axios. Ao receber `401`, o cliente troca o **refresh token** por um novo par (rotacao) e refaz a requisicao automaticamente (single-flight, sem loops). O refresh token e guardado **hasheado (sha256)** no banco, podendo ser **revogado** — o `logout` o invalida no servidor.
- **Migrations versionadas:** `synchronize` desativado; o schema e criado/evoluido por migrations em `src/migrations`, executadas automaticamente no boot (`migrationsRun`). Scripts: `npm run migration:run | migration:revert | migration:generate`.
- **Cache em memoria das respostas do GitHub** (TTL ~60s) para reduzir chamadas repetidas e o risco de atingir o rate limit (60 req/h sem token).
- **Paginacao:** as buscas aceitam `page` e retornam `totalPages`/`totalCount`, respeitando o teto de 1000 resultados da Search API.
- **Validacao e seguranca:** `ValidationPipe` global com whitelist, `helmet`, CORS restrito ao frontend e rate limiting com `@nestjs/throttler`.

### Endpoints principais
| Metodo | Rota | Protegida | Descricao |
|--------|------|-----------|-----------|
| POST | `/api/auth/register` | Nao | Cria conta e retorna access + refresh token |
| POST | `/api/auth/login` | Nao | Autentica e retorna access + refresh token |
| POST | `/api/auth/refresh` | Nao | Gera novo par de tokens (rotaciona o refresh) |
| POST | `/api/auth/logout` | Nao | Revoga o refresh token (logout no servidor) |
| GET | `/api/auth/me` | Sim | Dados do usuario logado |
| GET | `/api/github/users/search?q=&page=` | Sim | Busca usuarios (paginada) |
| GET | `/api/github/users/:username` | Sim | Perfil + agregacoes (linguagens, stars, top repos) |
| GET | `/api/github/repos/search?q=&language=&sort=&page=` | Sim | Busca repositorios (paginada) |
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
JWT_EXPIRES_IN=15m        # validade do access token
REFRESH_EXPIRES_DAYS=7    # validade do refresh token (dias)
CLIENT_URL=http://localhost:5173
GITHUB_TOKEN=        # opcional, aumenta o rate limit para 5000 req/h
PORT=3000
```
Inicie a API:
```bash
npm run start:dev
```
A API sobe em `http://localhost:3000/api` (Swagger em `/api/docs`). As **migrations rodam automaticamente no boot**, criando o schema; para rodar manualmente use `npm run migration:run`.

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
# Backend e2e (Supertest) - fluxo HTTP completo
cd backend && npm run test:e2e

# Frontend (Vitest + Testing Library) - utils e componentes
cd frontend && npm test
# Frontend e2e (Playwright) - smoke de navegador
cd frontend && npm run test:e2e:install && npm run test:e2e
```

Cobertura: `npm run test:cov` em cada projeto.

- **Backend (unidade):** `AuthService` (registro/login, hash de senha, conflitos, credenciais invalidas, **refresh com rotacao** e **logout/revogacao**), `GithubService` (mapeamento/agregacao e erro 404) e `AuthController`.
- **Backend (e2e):** registro -> login -> rota protegida (401 sem token) -> refresh com rotacao -> logout, alem do proxy do GitHub. Roda sobre **fakes em memoria** (o ambiente nao compila drivers nativos de SQLite), exercitando todo o pipeline HTTP (validacao, guard, rotas, status).
- **Frontend (unidade):** utilitarios (`formatNumber`, `extractErrorMessage`) e componentes (`StatCard`, `EmptyState`, pagina de `Login`).
- **Frontend (e2e):** Playwright valida render do login, redirecionamento de rota protegida e navegacao login -> cadastro.

## CI/CD

Pipeline em **GitHub Actions** ([.github/workflows/ci.yml](.github/workflows/ci.yml)) executado a cada push/PR na `main`, com tres jobs:
1. **Backend** - `npm ci`, `npm run build`, `npm test`, `npm run test:e2e`.
2. **Frontend** - `npm ci`, `npm test`, `npm run build` e e2e com Playwright (`npx playwright install` + `npm run test:e2e`).
3. **Docker** - build das imagens do backend e do frontend para validar os Dockerfiles.

## Docker

- `backend/Dockerfile` - build multi-stage (Node) servindo a API com apenas as dependencias de producao.
- `frontend/Dockerfile` - build do Vite e publicacao estatica via **Nginx** (com SPA fallback).
- `docker-compose.yml` - orquestra PostgreSQL + backend + frontend.

---



## Licenca
MIT
