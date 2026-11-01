# Deploy no Railway

Repositório: `github.com/badenpowelll/pousadajsmg`. O projeto já traz `railway.json` (build e start) e `nixpacks.toml` (Node 22).

## Passo a passo

1. Em railway.app → **New Project** → **Deploy from GitHub repo** → escolha `pousadajsmg`.
2. No mesmo projeto, **+ New** → **Database** → **PostgreSQL**.
3. No serviço do app → **Variables**, adicione:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (referência ao banco criado)
   - `SESSION_SECRET` = valor aleatório longo (ex.: `openssl rand -base64 48`)
   - `NEXT_PUBLIC_SITE_URL` = `https://<seu-dominio>` (use primeiro o domínio gerado pelo Railway)
   - `ESTABLISHMENT_TIMEZONE` = `America/Sao_Paulo`
   - `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` = credenciais iniciais do painel
   - Opcional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `INSTAGRAM_ACCESS_TOKEN`
4. **Settings → Networking → Generate Domain** para obter a URL pública.
5. O deploy roda `npm run db:migrate && npm run start` a cada start. Na **primeira vez**, rode o seed uma vez: Railway → serviço → **Shell** (ou localmente apontando `DATABASE_URL` para o banco do Railway) → `npm run db:seed`.
6. Entre em `/admin`, troque a senha, preencha Configurações e cadastre fotos reais.

## Domínio próprio

Settings → Networking → Custom Domain; aponte o CNAME no registrador; atualize `NEXT_PUBLIC_SITE_URL` e, se usar Google, o redirect URI.

## Operação

- Backups: ative no serviço Postgres do Railway (ou `pg_dump` agendado).
- Logs: aba **Logs** do serviço; erros de servidor aparecem com stack trace.
- Healthcheck: `/` (configurado em `railway.json`).
- Escala: uma instância é suficiente; com mais de uma, trocar o rate limit em memória por Redis.
