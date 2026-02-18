# Deploy na Vercel – Quitanda

Dois projetos Vercel: um para o **frontend** (React/Vite) e outro para a **API** (Node/Express). Repositório em monorepo (raiz com `frontend/` e `backend/`).

---

## Monorepo na Vercel – dá problema?

**Não.** A Vercel lida bem com front e back no mesmo repositório.

- Você cria **dois projetos** no dashboard, ambos apontando para o **mesmo repositório**.
- Em cada projeto você define um **Root Directory** diferente:
  - Projeto 1: Root = `frontend` → a Vercel só usa a pasta `frontend` (npm install, build e deploy são feitos ali).
  - Projeto 2: Root = `backend` → a Vercel só usa a pasta `backend`.
- Cada deploy é independente: o projeto do front não enxerga o `backend`, e o projeto da API não enxerga o `frontend`. Não há conflito.

**Serverless (API):** o backend vira **uma única função serverless**: a app Express é invocada a cada requisição. Pode haver um “cold start” de 1–2 segundos na primeira requisição após um tempo sem uso; depois disso fica rápido. Para um projeto de faculdade/quitanda isso costuma ser tranquilo.

**Frontend:** o build do Vite gera arquivos estáticos (HTML, JS, CSS). A Vercel só serve esses arquivos; não é serverless no front.

---

## 5.1 Conta e repositório

- Criar conta em [vercel.com](https://vercel.com) (login com GitHub/GitLab/Bitbucket).
- Subir o código para um repositório Git e conectar à Vercel (quando for fazer o deploy).
- Estrutura: monorepo; na Vercel serão criados **dois projetos**, cada um com **Root Directory** diferente.

---

## 5.2 Deploy do frontend (React)

1. No dashboard da Vercel: **Add New** → **Project** e importar o repositório.
2. Configurar o projeto:
   - **Root Directory**: `frontend` (ou marcar e escolher a pasta `frontend`).
   - **Framework Preset**: Vite (detectado automaticamente).
   - **Build Command**: `npm run build`.
   - **Output Directory**: `dist`.
3. **Environment Variables** (Production e Preview):
   - `VITE_API_URL`: URL base da API em produção (ex.: `https://quitanda-api.vercel.app`).  
     Sem barra no final. Exemplo: `https://seu-projeto-api.vercel.app`
4. **Deploy**. Anotar a URL do frontend (ex.: `https://quitanda.vercel.app` ou `https://projeto.vercel.app`).

---

## 5.3 Deploy da API (Node)

1. Novo projeto na Vercel: **Add New** → **Project**, mesmo repositório.
2. Configurar:
   - **Root Directory**: `backend`.
   - **Framework Preset**: Other (ou None). A Vercel detecta o `index.js` na raiz do backend que exporta a app Express.
3. **Environment Variables** (Production e Preview):
   - `DATABASE_URL`: connection string do Neon (PostgreSQL).
   - `JWT_SECRET`: chave secreta para JWT (string longa e aleatória).
   - `CORS_ORIGIN`: URL do frontend na Vercel (ex.: `https://quitanda.vercel.app`).  
     Pode ser `*` em desenvolvimento; em produção use a URL exata do front.
4. **Deploy**. Anotar a URL da API (ex.: `https://quitanda-api.vercel.app`).

Depois de deployar a API, voltar ao projeto do **frontend** e garantir que `VITE_API_URL` está com essa URL da API (e fazer redeploy do front se mudou).

---

## 5.4 Link público

O **link da aplicação** é a URL do frontend na Vercel (ex.: `https://nome-do-projeto.vercel.app`). Usar esse link no README e no PDF de entrega.

---

## 5.5 Documento de prompts de IA

Usar o arquivo `docs/prompts-ia.md` para colar os prompts usados com IA e, se possível, print ou cópia da resposta, conforme pedido na entrega.

---

## 5.6 PDF de entrega

Elaborar um único PDF com: nomes completos e matrículas de todos os integrantes, **link da aplicação na Vercel** e, se exigido, resumo do que foi feito e das melhorias. Enviar por um único integrante no canal indicado.

---

## Resumo rápido

| Projeto  | Root Directory | Variáveis de ambiente |
|----------|----------------|------------------------|
| Frontend | `frontend`     | `VITE_API_URL` = URL da API |
| API      | `backend`      | `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` |

**Ordem sugerida:** 1) Deploy da API; 2) Anotar URL da API; 3) Deploy do frontend com `VITE_API_URL` apontando para essa URL; 4) Testar login e fluxos no link do frontend.
