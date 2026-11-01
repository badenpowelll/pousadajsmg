# Pousada J Gostoso — site e sistema de reservas

Site público premium + motor de solicitação de reservas + painel administrativo, para um estabelecimento (preparado para evoluir a multi-tenant).

Stack: Next.js 15 (App Router) · React 19 · TypeScript estrito · Tailwind CSS 4 · PostgreSQL · Drizzle ORM · Zod · Vitest.

## Rodar localmente

```bash
cp .env.example .env         # edite DATABASE_URL, SESSION_SECRET etc.
npm install
npm run db:migrate           # aplica as migrações SQL de ./drizzle
npm run db:seed              # cria estabelecimento, acomodações de exemplo e admin
npm run dev                  # http://localhost:3000
```

Painel: `http://localhost:3000/admin` — usuário e senha definidos por `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (padrão `admin@exemplo.com` / `admin12345`). **Troque a senha no primeiro acesso** (Configurações → Minha senha).

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` / `npm start` | build e servidor de produção |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | testes unitários + integração (precisa de `DATABASE_URL` de desenvolvimento) |
| `npm run db:generate` | gera migração a partir de `src/db/schema.ts` |
| `npm run db:migrate` | aplica migrações |
| `npm run db:seed` | dados iniciais (idempotente) |
| `npm run db:studio` | Drizzle Studio |

## Variáveis de ambiente

Veja `.env.example`. Obrigatórias: `DATABASE_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`. Opcionais: `ESTABLISHMENT_TIMEZONE`, `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (login do hóspede), `INSTAGRAM_ACCESS_TOKEN` (feed automático).

## Documentação

- `docs/ARCHITECTURE.md` — estrutura, fluxo de reserva, modelo de dados
- `docs/DECISIONS.md` — registro de decisões técnicas
- `docs/DEPLOY.md` — implantação no Railway
- `docs/GOOGLE_LOGIN.md` — credenciais do login com Google
- `docs/INSTAGRAM.md` — feed do Instagram (embed e API)
- `docs/TESTING.md` — checklist de testes
- `CLAUDE.md` — convenções para sessões futuras

## O que ainda depende de configuração

- Dados reais da pousada (telefone, WhatsApp, e-mail, endereço, coordenadas): painel → Configurações.
- Fotos reais: as imagens em `public/demo` são placeholders. Hospede as fotos (ou coloque em `public/`) e cadastre as URLs no painel.
- Login com Google: credenciais no Google Cloud (ver `docs/GOOGLE_LOGIN.md`).
- Instagram automático: token da API da Meta (ver `docs/INSTAGRAM.md`).
- E-mails transacionais (confirmação ao hóspede) e pagamento online: não implementados; ver `docs/ARCHITECTURE.md` → Próximos passos.
