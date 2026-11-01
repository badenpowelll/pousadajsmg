# Instagram no site

Perfil: https://www.instagram.com/jgostososmg

Há dois modos, escolhidos automaticamente:

## 1. Feed automático (fotos e vídeos) — requer token da Meta

Mostra as últimas publicações (imagens, vídeos e carrosséis) com link para o post.

Requisitos: conta do Instagram **Business ou Creator**, um app em developers.facebook.com com o produto **Instagram** (login do Instagram / Graph API) e um **token de longa duração** (60 dias, renovável). Coloque-o em `INSTAGRAM_ACCESS_TOKEN`. O site consulta `graph.instagram.com/me/media` com cache de 1 hora.

Renovação do token: antes de expirar, chame `GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=<token>` e atualize a variável. (Automatizar isso é um próximo passo.)

## 2. Posts incorporados — sem token

No painel → **Galeria e Instagram**, cole o link de posts ou reels. O site usa o embed oficial (`instagram.com/embed.js`), que exibe foto/vídeo e legenda. Funciona só para posts públicos.

Em ambos os modos há o botão "Seguir no Instagram" com o link do perfil (Configurações → Instagram).
