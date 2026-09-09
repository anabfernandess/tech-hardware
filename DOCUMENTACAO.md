# DOCUMENTAÇÃO — Tech Hardware

Documentação técnica didática do projeto **Tech Hardware** (loja virtual de hardware em front-end puro), para estudo de Engenharia de Software e apresentação em portfólio.

Tudo aqui foi baseado no código real do repositório. Se algum trecho chamar de "simulado", é porque no código não existe processamento real por trás — apenas representação visual.

---

## 1. Visão geral da arquitetura

O projeto é uma **SPA antiga sem framework**: uma única página HTML (`index.html`) que é preenchida dinamicamente por JavaScript. Não há roteamento, backend ou banco de dados.

A divisão de responsabilidades é feita por 3 arquivos JavaScript:

| Arquivo JS | Responsabilidade |
|---|---|
| `js/products.js` | **Dados** — só declara a constante global `PRODUCTS` (os 24 produtos). Não tem lógica. |
| `js/script.js` | **Catálogo + Carrinho** — vitrine (filtro, busca, ordenação), sidebar do carrinho, persistência, e a "ponte" pública `window.ShopAPI` que o checkout consome. |
| `js/checkout.js` | **Checkout** — modal em 6 passos, formulários, validação, máscaras, ViaCEP, revisão e confirmação. Consome `ShopAPI`. |

Todos os arquivos JS são **IIFEs** (`(() => { ... })();`) — cada um roda imediatamente ao carregar e isola suas variáveis do escopo global, exceto o que é exposto de propósito (`PRODUCTS`, `window.ShopAPI`, `window.Checkout`).

Ordem de carregamento no HTML (importante — define as dependências):

```html
<script src="js/products.js"></script>
<script src="js/script.js"></script>
<script src="js/checkout.js"></script>
```

`script.js` define `ShopAPI`; `checkout.js` usa `ShopAPI` e expõe `window.Checkout`. O clique no botão "Finalizar compra" (`#checkoutBtn`) chama `ShopAPI.openCheckout()`, que por sua vez chama `Checkout.open()`.

---

## 2. Responsabilidade de cada arquivo

### `index.html`
Estrutura semântica fixa:
- **Cabeçalho** (`header`): logo, busca (`#searchInput`), botão do carrinho (`#cartBtn`) e navegação de categorias (`.cat-pill`).
- **Hero**: texto de apresentação e chamada para a loja.
- **Seção de vantagens** (estática, `#vantagens`).
- **Loja** (`#loja`): cabeçalho com totalizador (`#resultsInfo`) e ordenação (`#sortSelect`); grade de produtos (`#productsGrid`) e estado vazio (`#emptyState`).
- **Newsletter** (`#newsletterForm`) e **rodapé** (estático).
- **Carrinho** (`#cartSidebar`): lista de itens (`#cartItems`), total (`#cartTotal`), botões `#checkoutBtn` e `#clearCartBtn`, e overlay `#overlay`.
- **Checkout** (`#checkoutOverlay`): contém progresso (`#checkoutProgress`), corpo (`#checkoutBody`) e rodapé (`#checkoutFooter`) — **tudo é renderizado por JS**.
- `#toast`: notificações pop-up.

### `css/styles.css`
Todo o visual. Usa **variáveis CSS** em `:root` (linha ~1) para o tema:

```css
:root {
  --bg: #0b0f17;
  --card: #151d2e;
  --primary: #22d3ee;
  --price: #4ade80;
  ...
}
```

Seções organizadas por comentários:
`Header`, `Categories bar`, `Hero`, `Features`, `Store`, `Cart sidebar`, `Overlay & toast`, `Checkout`, `Responsive`.

É neste arquivo que se muda a **paleta de cores** do site (ver seção 8).

### `js/products.js`
Define `const PRODUCTS = [...]` com objetos de produto. Campos de cada produto:

```js
{
  id: 1,
  name: "AMD Ryzen 7 7800X3D",
  category: "processadores",
  price: 3499.90,
  oldPrice: 3899.90,      // opcional
  icon: "fa-microchip",   // classe CSS do Font Awesome
  badge: "Vendido",        // opcional: "Promo" | "Vendido" | "Top"
  specs: ["8 núcleos · 16 threads", "Até 5.0 GHz", "AM5"]
}
```

### `js/script.js`
- Constrói os cards (`productCard()`) e liga o botão de adicionar.
- Filtra/busca/ordena (`filterProducts()`).
- Gerencia o carrinho (`addToCart`, `changeQty`, `removeItem`, `clearCart`, `totalPrice`).
- Persiste em `localStorage` (`loadCart`/`saveCart`).
- Renderiza a sidebar (`renderCart`) e o preview (`renderPreview`).
- Expõe `window.ShopAPI` para o checkout.
- Controla `openCart`/`closeCart` e o toast.

### `js/checkout.js`
Todo o fluxo de finalização:
- Estado do checkout (`state`) com `step`, `data`, `receipt`, `finished`.
- Renderização por etapa (`stepDados`, `stepEndereco`, `stepEntrega`, `stepPagamento`, `stepRevisao`, `stepConfirmacao`).
- Validação (`ruleFor`, `checkFields`, `validateStep`).
- Máscaras (`applyMaskPhone`, `applyMaskCep`) e busca ViaCEP (`lookupCep`).
- Navegação (`nextStep`, `backStep`) e finalização (`finalizeOrder`, `generateOrderNumber`).

---

## 3. Fluxo completo — da escolha do produto à confirmação

```
1. Vitrine        → usuário filtra/busca e clica "Adicionar ao carrinho"
2. Carrinho       → sidebar abre; usuário ajusta quantidades
3. "Finalizar"    → #checkoutBtn → ShopAPI.openCheckout() → Checkout.open()
4. Etapa 1 Dados  → nome, e-mail, telefone (validação + máscara)
5. Etapa 2 Endereço → CEP (máscara + ViaCEP), rua, nº, complemento, bairro, cidade, UF
6. Etapa 3 Entrega → escolhe frete (frete grátis se subtotal ≥ 500)
7. Etapa 4 Pagamento → Pix ou Cartão (simulados)
8. Etapa 5 Revisão → confere itens/endereço/frete/pagamento/totais
9. Confirmar      → finalizeOrder(): cria nº do pedido, limpa carrinho
10. Etapa 6       → tela de confirmação com aviso de demo
```

### Detalhes do fluxo

**Bloqueio de carrinho vazio** (em `checkout.js`, função `open()`):
```js
function open() {
    if (!shop() || shop().isCartEmpty()) {
      showToast("Adicione produtos ao carrinho antes de finalizar.");
      return;
    }
    if (!state.finished) state.step = 1;
    ...
}
```
Ou seja: só abre o modal se o carrinho tiver itens. Ao reabrir (sem ter finalizado), o `step` volta para 1, **mas os dados preenchidos ficam guardados** em `state.data`.

**Limpeza do carrinho apenas no fim** (em `finalizeOrder()`):
```js
state.step = 6;
state.finished = true;
shop().clearCart();
render();
```
O carrinho só é limpo **depois** da confirmação — não ao abrir o checkout nem ao navegar entre etapas.

**Preservação ao voltar/avançar**: os inputs atualizam `state.data` em tempo real (listeners em `bindLive`, `bindDados`, `bindEndereco`). Ao voltar, a etapa é re-renderizada com `state.data` como origem dos valores. Por isso navegar para trás nunca perde o que foi digitado.

---

## 4. Carrinho em detalhe

### Estrutura em memória
O carrinho é um array de `{ id, qty }` (`state.cart` em `script.js`). **Não** guarda o produto — guarda só a referência `id`. O produto em si é buscado de `PRODUCTS` quando necessário:

```js
function totalPrice() {
  return state.cart.reduce((acc, i) => {
    const p = PRODUCTS.find((x) => x.id === i.id);
    return acc + (p ? p.price * i.qty : 0);
  }, 0);
}
```

Esse cálculo de `totalPrice()` é o que `ShopAPI.getSubtotal()` expõe — o **subtotal** é a soma de `preço × quantidade` de todos os itens.

### Quantidade
- **Adicionar** (`addToCart`): se o item já existe, `qty += 1`; senão, cria `{ id, qty: 1 }`.
- **Aumentar/diminuir** (`changeQty(id, delta)`): `qty += delta`; quando `qty <= 0`, o item é removido do array.
- **Remover** item (`removeItem`) e **limpar** tudo (`clearCart`).

### Subtotal, frete e total
Os cálculos ficam em `checkout.js`:

```js
function shippingPrice() {
  if (subtotal() >= FREE_SHIPPING_AT) return 0;
  const opt = SHIPPING_OPTIONS.find((o) => o.id === state.data.shipping) || SHIPPING_OPTIONS[1];
  return opt.price;
}

function totalPrice() {
  return subtotal() + shippingPrice();
}
```

Resumo da matemática do sistema:

| Grandeza | Fórmula | Onde |
|---|---|---|
| Subtotal | `Σ (preço × qtd)` | `ShopAPI.getSubtotal()` (via `totalPrice` do `script.js`) |
| Frete | `0` se subtotal ≥ `FREE_SHIPPING_AT`; senão preço da opção escolhida | `shippingPrice()` (`checkout.js`) |
| Total | `subtotal + frete` | `totalPrice()` (`checkout.js`) |

### Descontos
- **Na vitrine**: o percentual "à vista no Pix · X% off" é calculado com `Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)` em `productCard`. **Importante:** isso é **apenas exibição** — o desconto não é aplicado em nenhum total.
- **No checkout**: o Pix não dá desconto adicional. O Cartão mostra parcelamento `total / 12` — também apenas informativo.

### Atualização de toda a interface
Depois de qualquer mudança, `renderCart()` é chamado e dispara um evento próprio:

```js
window.dispatchEvent(new CustomEvent("shop:cart-changed"));
```

O `checkout.js` escuta esse evento para atualizar o resumo lateral do pedido (`#co-summary`) em tempo real (função anônima no final do arquivo).

---

## 5. Checkout em etapas — campos, validações e mensagens

O progresso é desenhado por `renderProgress()`: 5 rótulos (`Dados`, `Endereço`, `Entrega`, `Pagamento`, `Revisão`) com estado `done` / `active`. A confirmação (`step === 6`) esconde o progresso.

Cada etapa é **uma função que devolve HTML** e é injetada em `#checkoutBody` por `renderBody()`; depois `bindStep()` liga os eventos. Em gratidão, os campos usam a classe `.field`, o erro fica em `.field-error` (visível via `.field.has-error`) e o input recebe `aria-invalid`.

### Etapa 1 — Dados
Campos obrigatórios: `#coNome`, `#coEmail`, `#coTelefone`.

Validação (função `ruleFor` em `checkout.js`), com as mensagens exatas:

| Campo | Regra | Mensagem de erro |
|---|---|---|
| Nome | `trim().length >= 3` | `Informe seu nome completo.` |
| E-mail | regex `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` | `Informe um e-mail válido.` |
| Telefone | 10+ dígitos (após remover não-dígitos) | `Telefone inválido — inclua o DDD.` |

### Etapa 2 — Endereço
Obrigatórios: `#coCep`, `#coRua`, `#coNumero`, `#coBairro`, `#coCidade`, `#coUf`. Opcional: `#coComplemento`.

| Campo | Regra | Mensagem |
|---|---|---|
| CEP | exatamente 8 dígitos | `CEP inválido — use 8 dígitos.` |
| Rua / Número / Bairro / Cidade | não vazio | `Informe a rua/número/bairro/cidade.` |
| Estado (UF) | selecionou uma UF | `Selecione o estado.` |

### Etapa 3 — Entrega
Nenhuma validação textual: uma das 3 opções já vem marcada (padrão `padrao`). Se subtotal < 500, mostra o banner "Adicione R$ X para ganhar frete grátis"; se ≥ 500, aplica frete grátis.

### Etapa 4 — Pagamento
Igual: `pix` (padrão) ou `cartao` já marcados. O detalhe (`renderPaymentDetail`) muda conforme a escolha: QR Code Pix fictício ou parcelamento simulado do cartão.

### Etapa 5 — Revisão
Regra especial: **carrinho não pode estar vazio** (`validateStep(5)`). Se vazio, aparece o aviso `.emptied-warning` e um toast `Carrinho vazio — adicione produtos antes de finalizar.`

### Mecânica geral da validação
- O botão `Continuar` chama `nextStep()` → `validateStep(state.step)`.
- `validateStep` chama `checkFields(ids, container)`, que aplica `ruleFor` em cada campo e marca `.has-error`.
- Ao digitar, `clearErrorOnInput` revalida **só aquele campo** e remove o erro assim que ele passa (feedback imediato).
- Sucesso → `state.step += 1` e `render()`.

### Navegação
```js
function nextStep() { ... }   // valida e avança
function backStep() { ... }   // volta sem perder os dados
```
Atalhos: tecla **Esc** fecha o checkout (comportamento em `checkout.js`); fechar com X também. Se o pedido já foi finalizado, fechar **reseta** o estado do checkout (`resetState()`); caso contrário, os dados ficam guardados para a próxima abertura.

---

## 6. Integração com ViaCEP e comportamento em falha

Em `checkout.js`, função assíncrona `lookupCep()` — disparada pelo evento **`blur`** (sair do campo) ou **Enter** no `#coCep`, desde que o CEP tenha 8 dígitos.

```js
const res = await fetch(`https://viacep.com.br/ws/${d}/json/`, { signal: AbortSignal.timeout(8000) });
```

- **Sucesso**: preenche Rua (`logradouro`), Bairro (`bairro`), Cidade (`localidade`) e UF (`uf`), limpa o erro do CEP, mostra `cep-status ok` ("Endereço preenchido") e foca no campo número. Atualiza `state.data` via `setField`.
- **CEP inexistente**: `data.erro` verdadeiro → status `cep-status fail` com mensagem *"CEP não encontrado — preencha manualmente."*
- **Erro de rede/timeout/HTTP** (bloco `catch`): status `fail` com *"Não foi possível consultar — preencha manualmente."*

Em todos os casos de falha, o usuário pode **preencher os campos manualmente** — a validação da etapa 2 não depende do ViaCEP, só da presença dos dados.

> Detalhe: o `AbortSignal.timeout(8000)` cancela a requisição após 8 segundos, evitando que o checkout fique "preso" esperando a rede.

---

## 7. Dados — memória, `localStorage` e envio

### Onde cada dado vive

| Dado | Local | Quando é apagado |
|---|---|---|
| Produtos | constante `PRODUCTS` (memória) | Nunca (vive enquanto a página está aberta) |
| Carrinho | `state.cart` (memória) **e** `localStorage["techhardware_cart"]` | Em memória: `clearCart()`/`removeItem`. No `localStorage`: ao limpar carrinho ou finalizar pedido (`saveCart()` grava `[]`) |
| Dados do checkout (formulário) | `state.data` (memória, `checkout.js`) | Ao **fechar o checkout depois de finalizar** (`resetState()`). Fechar sem finalizar **mantém** os dados |
| Recibo do pedido | `state.receipt` (memória) | Junto com `resetState()` (fechamento pós-confirmação) |
| Número do pedido | gerado em `generateOrderNumber()` e exibido | Não é persistido |

### Persistência (localStorage)
Somente o carrinho é persistido:

```js
// carregar
return JSON.parse(localStorage.getItem("techhardware_cart")) || [];
// salvar
localStorage.setItem("techhardware_cart", JSON.stringify(state.cart));
```

### Envio para serviços
- **Não há backend.** Nenhum formulário de checkout é enviado a servidor algum.
- O único dado que sai do navegador é o **CEP** (8 dígitos), enviado à **ViaCEP** (`api.viacep.com.br`) em uma requisição `GET`, apenas para consulta de endereço. Nome, e-mail, telefone e endereço completo ficam só em memória.
- A newsletter não envia nada: `preventDefault()` + `reset()` + toast.

---

## 8. Como alterar produtos, preços, categorias, cores e regras de frete

### Adicionar/editar produtos — `js/products.js`
Copie/edite um objeto do array `PRODUCTS`:

```js
{
  id: 25,                       // único, não repetir
  name: "Nome do produto",
  category: "processadores",     // precisa existir em CATEGORY_NAMES + pill
  price: 1299.90,
  oldPrice: 1499.90,            // opcional (gera o "X% off" no card)
  icon: "fa-microchip",          // classe de ícone do Font Awesome
  badge: "Promo",                // "Promo" | "Vendido" | "Top" (ou remova)
  specs: ["spec1", "spec2", "spec3"]
}
```

> **Atenção:** o `id` precisa ser único. O carrinho guarda o `id` no `localStorage` — se um produto for apagado do `PRODUCTS` depois que alguém o colocou no carrinho, o item fica "órfão" (é ignorado na lista, mas conta no badge — ver seção 11).

### Categorias — 3 lugares
1. **Pill** no `index.html` (ex.: `<button class="cat-pill" data-category="processadores">…`).
2. Nome legível em `CATEGORY_NAMES` no `script.js` (`processadores: "Processadores"`).
3. `category` do produto em `products.js`.

### Cores e tema — `css/styles.css`
Tudo em `:root`:
- `--bg` / `--bg-soft` (fundos)
- `--card` (cartões) e `--border` (bordas)
- `--primary` (ciano atual), `--accent`, `--price`, `--danger`
- `--text` / `--muted`

Alterar `--primary: #22d3ee` para outra cor recolora botões, links, badges, destaques e o checkout inteiro de uma vez.

### Regras de frete — `js/checkout.js`
```js
const FREE_SHIPPING_AT = 500;   // limiar do frete grátis

const SHIPPING_OPTIONS = [
  { id: "economica", name: "Econômica", price: 24.9, days: "7–10 dias úteis", icon: "fa-truck" },
  { id: "padrao",   name: "Padrão",    price: 39.9, days: "3–5 dias úteis",    icon: "fa-truck-fast" },
  { id: "expressa", name: "Expressa",  price: 69.9, days: "1–2 dias úteis",    icon: "fa-bolt" }
];
```
- Mude `FREE_SHIPPING_AT` (ex.: 300) para alterar o limiar.
- Adicione/remova opções no array (o `id` é usado como `name="coShipping"` nos radios).
- O `price` do frete não pode ser menor que 0; frete grátis é aplicado pela função `shippingPrice()` quando o subtotal ≥ limiar (sobrescreve o preço da opção).

### Métodos de pagamento — `js/checkout.js`
O array `PAYMENT_OPTIONS` controla Pix/Cartão. O "12x sem juros" é uma **constante fixa** dividida pelo total (`totalV / 12`).

---

## 9. Funções reais (guia de estudo)

### `js/script.js`
| Função | O que faz |
|---|---|
| `filterProducts()` | Aplica categoria + busca + ordenação em `PRODUCTS` |
| `productCard(p)` | Monta o HTML do card (badge, specs, preços, botão) |
| `render()` | Recarrega a grade e religa os botões "Adicionar" |
| `addToCart(id)` / `changeQty` / `removeItem` / `clearCart` | Operações do carrinho |
| `totalPrice()` | Subtotal (Σ preço × qtd) |
| `loadCart()` / `saveCart()` | Lê/grava `localStorage["techhardware_cart"]` |
| `renderCart()` | Redesenha sidebar + badge + total e emite `shop:cart-changed` |
| `openCart()` / `closeCart()` | Abre/fecha a sidebar + overlay |
| `showToast(msg)` / `flashButton(btn)` | Feedback visual |

`window.ShopAPI` (ponte para o checkout): `getCartItems`, `getSubtotal`, `isCartEmpty`, `cartCount`, `findProduct`, `clearCart`, `closeCart`, `openCart`, `openCheckout`.

### `js/checkout.js`
| Função | O que faz |
|---|---|
| `open()` | Guarda carrinho vazio + reabre na etapa 1 preservando dados |
| `close()` / `resetState()` | Fecha modal; reseta estado se pedido finalizado |
| `render()` → `renderProgress/body/footer` | Desenha a etapa atual |
| `stepDados/Endereco/Entrega/Pagamento/Revisao/Confirmacao()` | Templates HTML de cada etapa |
| `summaryAside()` | Resumo lateral do pedido (itens, frete, total) |
| `shippingPrice()` / `totalPrice()` | Cálculos de frete e total |
| `bindLive(id, key)` / `bindDados` / `bindEndereco` / `bindOptions` | Liga eventos dos inputs/radios |
| `applyMaskPhone` / `applyMaskCep` | Máscaras |
| `lookupCep()` / `setField()` | ViaCEP + preenchimento |
| `ruleFor(id, value)` / `checkFields` / `setFieldError` / `clearErrorOnInput` | Validação e exibição de erros |
| `validateStep(step)` | Orquestra validação por etapa |
| `nextStep()` / `backStep()` | Navegação |
| `finalizeOrder()` / `generateOrderNumber()` | Confirma o pedido e gera o número `TH-YYYYMMDD-XXXXX` |

Exemplo de trecho a estudar — geração do número do pedido (`finalizeOrder`):
```js
state.receipt = {
  number: generateOrderNumber(),
  total: totalV,
  payment: pay.name,
  delivery: shipOpt.days,
  count: shop().cartCount()
};
state.step = 6;
state.finished = true;
shop().clearCart();
```

---

## 10. Testes executados, como reproduzir e limitações

### Testes efetivamente executados (durante o desenvolvimento)

**1. Checagem de sintaxe (Node.js)**
```bash
node --check js/products.js
node --check js/script.js
node --check js/checkout.js
```
Resultado: os 3 arquivos passaram sem erro de sintaxe.

**2. Teste E2E automatizado com Playwright + Edge (headless)**

- Ferramenta: `playwright-core` (Node), conectando ao **Edge instalado** (`channel: "msedge"`) — não houve download de navegador.
- Cenários cobertos (48 verificações, todas passaram):

| Cenário | Resultado |
|---|---|
| Página carrega com 24 produtos | ✔ |
| Checkout bloqueado com carrinho vazio (toast + modal não abre) | ✔ |
| Adicionar item; subtotal = R$ 199,90 (< 500) | ✔ |
| Etapa 1: 3 erros com campos vazios; erros com nome curto/e-mail inválido/telefone incompleto | ✔ |
| Avançar/voltar preservando nome, telefone e endereço | ✔ |
| Etapa 3 avisa frete pago (subtotal < 500) | ✔ |
| Pagamento padrão = Pix; troca para cartão mostra parcelamento simulado; voltar preserva a seleção | ✔ |
| Revisão com 5 blocos; subtotal 199,90 + frete 69,90 = 269,80; endereço/entrega/pagamento corretos | ✔ |
| Fechar por X preserva carrinho e reabertura preserva dados | ✔ |
| **Alteração do carrinho**: +1 item → subtotal 549,80; frete vira **Grátis**; total 549,80 | ✔ |
| Confirmação: número `TH-YYYYMMDD-XXXXX`, aviso de demonstração, total exibido | ✔ |
| Cartão limpo **só após** confirmação; `localStorage` fica `[]` | ✔ |
| Após voltar à loja, checkout bloqueado de novo (carrinho vazio) | ✔ |
| Viewport **mobile 390×844**: fluxo completo sem scroll horizontal | ✔ |

**3. Captura de screenshots** de todas as etapas (desktop e mobile) para inspeção visual.

### Como reproduzir os testes
Os arquivos de teste (`server.js` e `test.js`) foram gerados em **pasta temporária do sistema** (não estão no repositório), então a reprodução exata exige recriá-los. Passos:

```bash
# 1) servir o projeto
cd hardware-store
python -m http.server 8765

# 2) criar o harness fora do projeto
mkdir co-tests && cd co-tests
npm init -y
npm i playwright-core
# 3) criar server.js: servidor estático apontando para a pasta hardware-store
#    criar test.js: as asserções acima (ver seção 10 deste documento)
node test.js
```

> **Limitação honesta:** o repositório não contém o harness de teste versão de controle. Para reproduzir, ele precisa ser recriado seguindo os cenários descritos. Isso é proposital para não poluir o projeto de estudo, mas o ideal seria versionar os testes junto do código.

### Testes apenas RECOMENDADOS (não executados)
- **Dispositivos físicos** (celular/tablet reais) — os testes usaram viewport emulado.
- **Outros navegadores** (Chrome, Firefox, Safari) — o teste rodou apenas no Edge.
- **Caminho de sucesso do ViaCEP na automação** — nos testes, a rede/CEP resultou no fluxo manual; o sucesso (preenchimento automático) foi verificado manualmente, mas não pela automação.
- **Inspeção visual humana** das screenshots (o modelo de IA que auxiliou no desenvolvimento não consegue ler imagens, então os prints foram salvos mas não inspecionados automaticamente).
- **Acessibilidade** (navegação por teclado completa, leitor de tela, `aria-live` nos erros).
- **Performance/Lighthouse** e testes com carrinho grande (várias unidades) e stress de inputs.

---

## 11. Itens para revisão (problemas/suposições encontrados no código)

Itens **não corrigidos**, registrados para análise futura:

1. **`localStorage` com item órfão.** Se um produto for removido de `PRODUCTS` após estar no carrinho, ele é ignorado na lista (`script.js` filtra com `if (!p) return ""`), mas o contador do badge (`cartCount`) ainda soma esse item. Sugestão: limpar ids inexistentes ao carregar o carrinho.

2. **Badge desconhecida vira "Top".** Em `productCard`, qualquer `badge` que não seja exatamente `"promo"` ou `"vendido"` recebe o estilo `badge-top`. Se criar um selo novo (ex.: `"Novo"`), ela ganha o visual laranja/vermelho sem querer.

3. **Desconto é informativo, não aplicado.** O "à vista no Pix · X% off" e o "até 12x de…" da vitrine não entram no total. Se a intenção for um desconto real, `totalPrice()` precisaria aplicar a regra — hoje Pix e cartão geram o **mesmo total**.

4. **Parcelamento da vitrine vs. checkout divergem.** Na vitrine o card divide `price / 12`; no checkout o cartão divide `(subtotal + frete) / 12`. As duas telas mostram valores diferentes para o mesmo produto — provavelmente aceitável para demonstração, mas é uma inconsistência a documentar.

5. **Toast "Carrinho limpo." durante o finalize.** `finalizeOrder()` chama `ShopAPI.clearCart()`, que por baixo dispara `showToast("Carrinho limpo.")` — aparece um toast atrás do modal de confirmação. Cosmético, mas fora do contexto.

6. **Código Pix fictício com caracteres de exibição.** A string do "QR Code" gerada em `renderPaymentDetail` contém caracteres (`$`) apenas decorativos; o código não é um Pix válido (proposital, é demo) — mas vale deixar explícito no code.

7. **Acessibilidade dos erros.** Os erros de campo ficam visíveis via `.has-error`, mas o elemento `.field-error` não tem `aria-live`/`role="alert"` — melhorar para leitores de tela.

---

## 12. Sugestão de rota de estudo (resumo)

Ordem recomendada para entender o projeto partindo do zero:
1. `README.md` — visão geral e o que é real/simulado (não técnico).
2. `index.html` — conhecer os "pontos de entrada" (ids) que o JS manipula.
3. `js/products.js` — os dados; é a menor peça.
4. `js/script.js` — vitrine e carrinho (fluxo de renderização + `ShopAPI`).
5. `js/checkout.js` — a peça maior: estados, validação, ViaCEP e finalização.
6. `css/styles.css` — o visual e a responsividade (seções comentadas).