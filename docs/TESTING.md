# Checklist de testes

## Automatizados (`npm test`)

- Unitários (`tests/unit`): datas ISO e noites; validação de busca (check-out > check-in, máximo 30 noites, hóspedes); cálculo de tarifa por noite com prioridade e mínimo de noites; conversão monetária; transições de status.
- Integração (`tests/integration`, usa o banco de `DATABASE_URL`): criação de solicitação e total; idempotência; capacidade excedida; data no passado; **3 pedidos simultâneos para a última unidade → só 1 passa**; cancelamento libera unidade; bloqueio reduz disponibilidade; confirmação revalida.

Também executados antes de cada entrega: `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual (executado em 31/10/2026 com Chrome headless)

- [x] Home, acomodações, detalhe, galeria, experiências, sobre, contato, políticas respondem 200.
- [x] Busca → "Solicitar reserva" → formulário → confirmação com código.
- [x] Painel: login, dashboard, confirmar reserva (histórico registrado), tarifas, acomodações.
- [ ] Login com Google (precisa de credenciais reais).
- [ ] Feed do Instagram com token (precisa de token real).
- [ ] Formulário de contato no navegador (ação testada por código; validar visualmente após deploy).
- [ ] Responsividade final com fotos reais (as placeholders mudam a composição).

## Ainda sem teste automatizado

- Fluxos end-to-end com Playwright (`@playwright/test` não instalado; `playwright-core` + Chrome do sistema foram usados em scripts avulsos).
- Server actions do painel (cobertas indiretamente pelos serviços).
