# Gomez Relógios — loja virtual em HTML/CSS/JavaScript

Este projeto foi preparado para uma loja de relógios com:

- Home
- Catálogo de produtos
- Página individual do relógio
- Carrinho com controle de quantidade
- Cálculo de frete por CEP via Melhor Envio
- Checkout via Mercado Pago
- Finalização alternativa pelo WhatsApp
- Quem somos
- Como comprar
- Trocas e devoluções
- Perguntas frequentes
- Política de privacidade
- Layout responsivo para celular e computador

## 1. O que você precisa editar primeiro

Abra `data.js` e altere:

- `whatsapp`: seu número de WhatsApp, somente números com DDI 55.
- `originCep`: CEP de onde os pedidos serão postados.
- os produtos dentro de `window.PRODUCTS`.

### Como colocar fotos reais

1. Entre na pasta `assets/produtos/`.
2. Coloque ali as fotos dos seus relógios.
3. Em `data.js`, troque o caminho de `image` e `gallery` pelo nome do arquivo.

Exemplo:

```js
image: 'assets/produtos/orient-1519.jpg',
gallery: [
  'assets/produtos/orient-1519.jpg',
  'assets/produtos/orient-1519-costas.jpg',
  'assets/produtos/orient-1519-pulso.jpg'
]
```

Se a foto não existir, o site mostra automaticamente uma imagem reserva.

## 2. Como colocar no ar sem saber programação

### Etapa A — criar uma conta no GitHub

1. Acesse https://github.com/ e crie sua conta.
2. Clique em **New repository**.
3. Nome sugerido: `gomez-relogios`.
4. Pode deixar o restante padrão e criar o repositório.

### Etapa B — enviar os arquivos

1. Abra o repositório novo.
2. Clique em **Add file > Upload files**.
3. Abra a pasta deste projeto no computador.
4. Selecione os arquivos e pastas do projeto e arraste para a área de upload do GitHub.
5. Faça o commit.
6. Confirme que o arquivo `index.html` está na raiz do repositório, e que a pasta `functions` também está na raiz.

### Etapa C — publicar no Cloudflare Pages

1. Crie uma conta em https://dash.cloudflare.com/.
2. Abra **Workers & Pages**.
3. Escolha criar uma aplicação Pages a partir de um repositório Git.
4. Conecte sua conta GitHub.
5. Selecione o repositório `gomez-relogios`.
6. Em **Production branch**, escolha `main`.
7. Em **Build command**, use `exit 0`.
8. Em **Build output directory**, use `.`.
9. Deixe o Root directory como a raiz do repositório.
10. Clique em **Save and Deploy**.

Depois do deploy, o Cloudflare fornecerá um endereço `*.pages.dev`.

## 3. Ativar o cálculo de frete

O código já possui a rota `/api/shipping`.

No Cloudflare, abra seu projeto e procure a área de **Variables and Secrets / Environment Variables**. Cadastre:

`MELHOR_ENVIO_TOKEN`

Valor: seu access token de produção do Melhor Envio.

`MELHOR_ENVIO_USER_AGENT`

Valor sugerido: `Gomez Relógios (seu-email@dominio.com)`

`GOMEZ_ORIGIN_CEP`

Valor: CEP de onde os pedidos serão postados, somente números.

Depois, salve e faça novo deploy.

## 4. Ativar o pagamento online

O código já possui a rota `/api/checkout` para criar uma preferência do Mercado Pago.

No Cloudflare, cadastre o segredo:

`MP_ACCESS_TOKEN`

Valor: seu Access Token de produção do Mercado Pago.

O token deve ficar somente no servidor. Não coloque Access Token em `data.js` ou em outro arquivo público.

Depois, salve e faça novo deploy.

## 5. Alterar preços e estoque

Para mudar preço, estoque, nome, descrição ou categoria, altere o produto em `data.js`.

Importante: neste starter, os preços também ficam validados no servidor em `functions/checkout.js`. Portanto, quando alterar o `price` de um produto, altere também o preço correspondente no mapa `catalog` desse arquivo.

## 6. Adicionar um novo relógio

Copie um objeto existente dentro de `window.PRODUCTS` e altere:

- `id`
- `brand`
- `name`
- `category`
- `price`
- `stock`
- `badge`
- `image`
- `gallery`
- `description`
- `specs`
- `shipping`

Depois, adicione o mesmo `id` e preço em `functions/checkout.js` e as dimensões/peso em `functions/shipping.js`.

## 7. WhatsApp

No `data.js`, substitua:

```js
whatsapp: '5561999999999'
```

pelo seu número real.

## 8. Domínio próprio

Você pode começar com o endereço gratuito `pages.dev` e depois conectar um domínio próprio. Para um negócio no Brasil, um domínio `.com.br` normalmente é contratado separadamente.

## 9. Antes de anunciar a loja

Revise obrigatoriamente:

- CNPJ/razão social
- endereço e canal de atendimento
- política de trocas e devoluções
- política de privacidade e cookies
- garantia de cada marca/produto
- preço e estoque
- dimensões reais das embalagens
- CEP de postagem
- contas de pagamento e logística

As páginas de trocas/devoluções e privacidade incluídas neste projeto são modelos e precisam ser personalizadas para a operação real.

## 10. Arquitetura resumida

```text
Cliente
  ↓
HTML + CSS + JavaScript
  ↓
Carrinho local
  ↓
/api/shipping → Melhor Envio
  ↓
/api/checkout → Mercado Pago
```

O carrinho funciona no navegador. O pagamento e o token de logística ficam em Functions no Cloudflare, para que as credenciais não fiquem expostas no frontend.
