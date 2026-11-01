# Login do hóspede com Google

O hóspede entra com a conta Google e, no primeiro acesso, completa **nome** e **WhatsApp**. Depois, o formulário de reserva vem preenchido e ele acompanha as reservas em `/conta`.

## Criar credenciais

1. console.cloud.google.com → crie um projeto (ex.: "Pousada J Gostoso").
2. **APIs e serviços → Tela de consentimento OAuth** → Externo → nome do app, e-mail de suporte, domínio do site → escopos `openid`, `email`, `profile`.
3. **Credenciais → Criar credenciais → ID do cliente OAuth → Aplicativo da Web**:
   - Origens JavaScript: `https://<seu-dominio>`
   - URIs de redirecionamento: `https://<seu-dominio>/conta/google/callback` (e `http://localhost:3000/conta/google/callback` para desenvolvimento)
4. Copie **ID do cliente** e **Chave secreta** para `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.
5. Enquanto o app estiver em "Teste" no Google, só os e-mails adicionados como testadores conseguem entrar; publique o app para liberar a todos.

## Como funciona no código

- `GET /conta/google` → gera `state`, grava em cookie e redireciona para o Google.
- `GET /conta/google/callback` → valida `state`, troca `code` por token, lê o perfil (`sub`, `email`, `name`, `picture`), cria/atualiza `guest_accounts`, abre sessão (`guest_sessions`, cookie httpOnly) e redireciona para `/conta/completar` se o cadastro não estiver completo.
- `src/lib/guest-auth.ts` concentra tudo; sem as variáveis, o botão aparece desativado e o site funciona normalmente.
