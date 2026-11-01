# CLAUDE.md — Pousada J SMG (Pousada J Gostoso)

Site + reservas + painel para um estabelecimento. Next.js 15 App Router, TypeScript estrito, Tailwind 4, PostgreSQL via **Drizzle** (não Prisma: ver docs/DECISIONS.md #1), Zod, Vitest.

## Comandos válidos
`npm run dev` · `npm run build` · `npm run typecheck` · `npm run lint` · `npm test` · `npm run db:generate` · `npm run db:migrate` · `npm run db:seed`

## Onde as coisas ficam
- Regras de negócio: `src/services/*` (pricing é puro; availability/reservations usam o banco).
- Schema: `src/db/schema.ts` → `npm run db:generate` → migração em `drizzle/` → `npm run db:migrate`. Nunca edite migrações já aplicadas.
- Site público: `src/app/(site)` (force-dynamic). Painel: `src/app/admin/(panel)` (toda página/ação chama `requireUser()`).
- Server actions: validar com Zod; usar `parseOrRedirect`/`back` de `src/lib/form.ts`; registrar em `audit_logs` via `audit()`.
- Datas de hospedagem são strings `YYYY-MM-DD`; helpers em `src/lib/dates.ts`. Dinheiro em centavos (int).

## Regras essenciais
- Reserva só nasce via `createReservationRequest` (transação + advisory lock). Não inserir em `reservations` diretamente.
- Mudança de status só via `changeReservationStatus`.
- Não inventar integrações: Google e Instagram dependem de variáveis de ambiente; sem elas, o site degrada com aviso.
- Dados de contato reais da pousada ainda não foram informados (seed marca "A CONFIRMAR").
- Antes de entregar: typecheck, lint, build, testes.
