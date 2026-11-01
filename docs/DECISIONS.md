# Registro de decisões técnicas

| # | Data | Decisão | Motivo |
| --- | --- | --- | --- |
| 1 | 2026-10-31 | Drizzle ORM em vez de Prisma | A CLI do Prisma (v6 e v7) exige download de binários de `binaries.prisma.sh`, bloqueado no ambiente de desenvolvimento. Drizzle é TypeScript puro, gera migrações SQL localmente e usa o mesmo PostgreSQL. |
| 2 | 2026-10-31 | Inventário por quantidade de unidades por categoria | Modelo mais simples para pousadas; evita conflito com lock por categoria. Unidades físicas podem ser adicionadas depois sem quebrar a API. |
| 3 | 2026-10-31 | Reserva nasce como SOLICITAÇÃO (`REQUESTED`) e ocupa inventário | O estabelecimento confirma manualmente; evita overbooking enquanto analisa. Pagamento online não faz parte do escopo inicial. |
| 4 | 2026-10-31 | Lock consultivo transacional (`pg_advisory_xact_lock`) | Serializa pedidos concorrentes da mesma categoria sem bloquear a tabela inteira. |
| 5 | 2026-10-31 | Autenticação própria com sessão em cookie (sem NextAuth) | Menos dependências; um único estabelecimento; controle total sobre a tabela de sessões. |
| 6 | 2026-10-31 | Login do hóspede via OAuth Google implementado manualmente | Fluxo OpenID simples (2 requisições); sem biblioteca. Requer credenciais do Google Cloud. |
| 7 | 2026-10-31 | Fontes do sistema em vez de `next/font/google` | O build no ambiente de desenvolvimento não alcança fonts.googleapis.com. Trocar por `next/font` é um ajuste de 5 linhas em `src/app/layout.tsx`. |
| 8 | 2026-10-31 | Imagens de demonstração locais (`public/demo`) | Links externos (Unsplash) não são alcançáveis no ambiente de build; placeholders deixam claro que são provisórias. |
| 9 | 2026-10-31 | Rotas do site com `force-dynamic` | Conteúdo vem do banco e é editado no painel; evita depender do banco na etapa de build (Railway). |
| 10 | 2026-10-31 | Instagram: API oficial com token OU embeds manuais | Não existe forma legítima de ler o perfil sem autorização da Meta. |
| 11 | 2026-10-31 | Rate limit em memória | Suficiente para uma instância; trocar por Redis se houver múltiplas réplicas. |
