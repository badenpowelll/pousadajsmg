# Arquitetura

## Estrutura

```
src/
  app/
    (site)/          site público (layout com header/footer/WhatsApp; force-dynamic)
      page.tsx, acomodacoes/, galeria/, experiencias/, sobre/, contato/, politicas/, privacidade/, termos/
      reservar/      busca (GET) → reservar/[slug] (formulário + server action) → reserva/[code]
      conta/         login Google, completar cadastro, minhas reservas
    admin/
      login/         autenticação por sessão (cookie httpOnly)
      (panel)/       layout protegido por requireUser(); dashboard, reservas, acomodações, tarifas, conteúdo, mensagens, configurações
    sitemap.ts, robots.ts, error.tsx
  components/site, components/admin
  services/          regras de negócio (puras ou com acesso ao banco)
    pricing.ts       quoteStay(): preço por noite (função pura)
    availability.ts  pico de ocupação por noite em SQL; calendário
    reservations.ts  schemas Zod, createReservationRequest (transação + lock), changeReservationStatus
    content.ts       leitura de conteúdo do site (cache por requisição)
    instagram.ts     API da Meta (com token) ou embeds manuais
  db/                schema Drizzle, cliente, seed
  lib/               auth (admin), guest-auth (Google), dates, money, ids, rate-limit, form, audit, whatsapp
drizzle/             migrações SQL versionadas
tests/unit, tests/integration
```

## Inventário e disponibilidade

Inventário **por quantidade de unidades por categoria** (`accommodation_types.units`). Não há unidade física identificada; a atribuição de quarto é feita na recepção. Consequências:

- Disponibilidade em [checkIn, checkOut) = `units − max_por_noite(reservas ativas sobrepostas + bloqueios)`.
- Reservas `REQUESTED` e `CONFIRMED` ocupam inventário; `CANCELLED`/`COMPLETED` não.
- Sobreposição: `r.check_in <= noite < r.check_out`.
- Bloqueios (`availability_blocks`) têm `units` e fim exclusivo.

## Concorrência

`createReservationRequest` roda em transação com `pg_advisory_xact_lock(hashtext(accommodationTypeId))`: pedidos simultâneos para a mesma categoria são serializados e o segundo vê a ocupação do primeiro (teste em `tests/integration`). `idempotencyKey` (gerada no formulário) impede duplicar a reserva em reenvio. Confirmar pelo painel revalida a disponibilidade sob o mesmo lock.

## Tarifas

`basePriceCents` por categoria + `rate_plans` por período (início/fim inclusivos, prioridade, mínimo de noites). O preço de cada noite é calculado no servidor (`quoteStay`) e gravado em `reservations.breakdown`; o total não muda se a tarifa for alterada depois.

## Estados da reserva

`REQUESTED → CONFIRMED | CANCELLED`; `CONFIRMED → CANCELLED | COMPLETED`. Toda mudança gera `reservation_status_changes` e `audit_logs`.

## Datas e fuso

Datas de hospedagem são strings `YYYY-MM-DD` (colunas `date`). "Hoje" é calculado em `ESTABLISHMENT_TIMEZONE` (`todayInTimezone`). Nunca se converte para `Date` local.

## Segurança

- Admin: senha bcrypt (12 rounds); sessão aleatória, hash SHA-256 no banco, cookie httpOnly/sameSite=lax/secure em produção; 7 dias.
- Hóspede: OAuth 2.0 Google (OpenID), state em cookie, sessão de 30 dias.
- Toda ação de servidor valida com Zod e chama `requireUser()`; OWNER para dados do estabelecimento e usuários.
- Rate limit em memória para login, contato e reservas; honeypot nos formulários públicos.
- Dados de cartão não existem no sistema (sem pagamento online).

## Próximos passos (não implementados)

1. E-mail/WhatsApp automático ao hóspede na solicitação e confirmação (Resend + WhatsApp Cloud API).
2. Upload de imagens no painel (S3/Cloudflare R2) em vez de URL.
3. Pagamento de sinal (Pix/cartão via Asaas ou Stripe) com confirmação por webhook.
4. Multi-tenant: `tenant_id` nas tabelas + RLS, domínio por tenant.
5. Channel manager (iCal/Channex) para sincronizar com Booking/Airbnb.
