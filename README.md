# Tech Hardware — Loja de Componentes de Hardware

> **Status:** Projeto demonstrativo, em desenvolvimento constante. Foi concebido com **auxílio de IA** (ver nota ao final).

## Apresentação

O Tech Hardware é uma loja virtual **single-page** de componentes de hardware (processadores, placas de vídeo, memórias RAM, SSDs, placas-mãe, fontes e gabinetes). O objetivo do projeto é praticar **desenvolvimento web front-end puro** — HTML, CSS e JavaScript — cobrindo desde a vitrine de produtos até um checkout completo em etapas, tudo sem frameworks e sem servidor de dados.

É um projeto **front-end de demonstração**: todo o "negócio" (produtos, frete, pagamento, pedidos) é simulado no navegador. Nenhuma compra real acontece.

## Objetivos de estudo

- Construir a UI de uma loja com **HTML semântico** e **CSS moderno** (variáveis, Grid/Flexbox, design responsivo).
- Organizar a lógica em **JavaScript vanilla** com separação clara de responsabilidades (dados, loja/catálogo, carrinho, checkout).
- Implementar um **fluxo de checkout multi-etapas** com validação de formulário, máscaras, integração com API externa (ViaCEP), persistência local (`localStorage`) e simulação de pagamento.

## Tecnologias realmente utilizadas

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura da página (semantic tags, `header`, `main`, `footer`, `aside`, `dialog` via div com `role="dialog"`) |
| **CSS3** | Layout com **Grid** e **Flexbox**, **Custom Properties** (`:root`), **Media Queries**, animações (`@keyframes`) |
| **JavaScript (vanilla ES6+)** | Lógica de catálogo, carrinho e checkout. Funções `const`/`let`, arrow functions, template literals, **IIFE**, `Intl.NumberFormat`, `localStorage`, `CustomEvent`, `fetch` + `async/await` |
| **Font Awesome 6** (CDN) | Ícones do site |
| **Google Fonts — Inter** (CDN) | Tipografia |
| **ViaCEP API** | Preenchimento automático de endereço a partir do CEP (consulta HTTP externa) |

**Não** são utilizados: frameworks/bibliotecas JS (React, Vue, JQuery), pré-processadores CSS, bundlers, build tools, backend ou banco de dados.

## Funcionalidades implementadas

### Vitrine
- Listagem de **24 produtos** em **7 categorias** (processadores, placas de vídeo, memória RAM, SSDs, placas-mãe, fontes e gabinetes).
- **Filtro por categoria** (abas/pills no topo).
- **Busca em tempo real** (por nome, categoria e especificações).
- **Ordenação**: relevância, menor preço, maior preço, nome (A–Z).
- Card de produto com preço, preço antigo riscado, selo ("Promo", "Vendido", "Top"), especificações e botão "Adicionar ao carrinho".
- Contagem de resultados exibida ("X de Y itens").

### Carrinho
- **Sidebar lateral** com itens, controle de **quantidade** (+/-), **remover item** e **limpar carrinho**.
- Badge com a quantidade total no ícone do carrinho.
- **Preview** dos 3 últimos itens ao passar o mouse sobre o carrinho.
- **Persistência em `localStorage`**: o carrinho sobrevive ao fechar/reabrir a página.
- **Subtotal** calculado automaticamente (soma de `preço × quantidade`).

### Checkout (5 etapas + confirmação)
1. **Dados do cliente** — nome, e-mail e telefone (com máscara).
2. **Endereço** — CEP (máscara + **busca no ViaCEP**) e campos de endereço.
3. **Entrega** — 3 opções simuladas de frete/prazo; **frete grátis automático para subtotal ≥ R$ 500**.
4. **Pagamento** — simulação de **Pix** ou **Cartão** (sem pedir dados reais).
5. **Revisão** — resumo de produtos, cliente, endereço, entrega, pagamento e totais (subtotal + frete = total).
6. **Confirmação** — gera um **número de pedido demonstrativo** (`TH-YYYYMMDD-XXXXX`), exibe resumo e avisa que nada foi cobrado.

### Extra
- Newsletter (formulário simulado, não envia e-mail).
- Rodapé com links institucionais (placeholders).
- Design **responsivo** (desktop, tablet e celular).
- **Toasts** de feedback (adicionado ao carrinho, erros, checkout bloqueado etc.).

## Como executar localmente

Pré-requisito: apenas um navegador moderno. Os scripts são locais e não precisam de instalação.

**Opção A — abrir direto (mais simples):**
1. Entre na pasta `hardware-store`.
2. Dê dois cliques em `index.html`.

**Opção B — servidor local (recomendado):**
```bash
cd hardware-store
python -m http.server 8080
```
Acesse `http://localhost:8080`.

Alternativas equivalentes: extensão "Live Server" do VS Code, ou `npx serve .`.

> Observações de execução:
> - Ícones (Font Awesome) e a fonte Inter vêm de CDNs: sem internet eles não carregam, mas o site não quebra (fica sem ícones/fonte customizada).
> - A busca de endereço usa a API pública **ViaCEP**, que exige internet (se falhar, os campos podem ser preenchidos manualmente — o site já trata isso).

## Estrutura de pastas e arquivos

```
hardware-store/
├── index.html        # Estrutura da página (vitrine, carrinho, modal de checkout)
├── css/
│   └── styles.css    # Todo o CSS: tema, componentes, checkout e responsividade
├── js/
│   ├── products.js   # DADOS: array com os 24 produtos (nome, preço, categoria, specs...)
│   ├── script.js     # Catálogo + carrinho + vitrine (busca, filtro, ordenação, sidebar)
│   └── checkout.js   # Checkout em etapas (formulário, validação, ViaCEP, revisão, confirmação)
├── README.md         # Este arquivo
└── DOCUMENTACAO.md   # Documentação técnica didática (para estudo/portfólio)
```

## O que funciona de verdade e o que é simulado

### Funciona de verdade (no navegador)
- **Catálogo**: filtro, busca, ordenação e renderização dos cards.
- **Carrinho**: adicionar/remover/alterar quantidades, subtotal, badge e preview.
- **Persistência**: o carrinho é salvo em `localStorage` do navegador (chave `techhardware_cart`).
- **Validações de formulário** e máscaras (CEP e telefone).
- **Frete grátis**: a regra de subtotal ≥ R$ 500 é calculada de verdade (aplica frete R$ 0).
- **Cálculos totais**: subtotal + frete = total, recalculados em tempo real.
- **Máscara de telefone e CEP**, bloqueio de checkout com carrinho vazio, preservação de dados ao voltar etapas, limpeza do carrinho **somente após** a confirmação.
- **Conexão real com o ViaCEP** para preencher o endereço (requer internet).

### Simulado (apenas visual/demonstrativo)
- **Pagamento**: Pix (QR Code e "código copia e cola" são **fictícios**) e cartão de crédito (parcelas **não são cobradas**). Nenhum dado bancário é enviado.
- **Frete**: valores (R$ 24,90 / R$ 39,90 / R$ 69,90) e prazos (7–10, 3–5, 1–2 dias úteis) são **taxas e datas fixas inventadas**, não consultas a transportadoras.
- **Registro de pedidos**: o "pedido" existe apenas na tela de confirmação. Não há banco de dados nem envio para nenhum serviço; o número gerado é ilustrativo.
- **Desconto "à vista no Pix · X% off"** nos cards: é **apenas informativo** (percentual calculado sobre o preço antigo). Ele **não** altera o subtotal nem o total do pedido.
- **Newsletter**: o clique apenas limpa o campo e mostra um toast. Nenhum e-mail é armazenado ou enviado.
- **Informações da empresa**: telefone, e-mail, CNPJ, endereço e redes sociais do rodapé são **fictícios** (dados de demonstração).

## Nota sobre desenvolvimento com auxílio de IA

Este projeto foi construído em parceria com um **assistente de IA** (este ambiente de desenvolvimento): a geração das páginas, a refatoração do carrinho, o implementação do checkout e os testes automatizados foram realizados com apoio da IA, sob revisão e direcionamento humano da autora/estudante. O código foi revisado e validado por testes automatizados executados durante o desenvolvimento. A documentação deste repositório também foi redigida com apoio de IA, baseada exclusivamente no código real do projeto.

## Autor

Projeto de estudo de **Engenharia de Software** — parte de portfólio. Nenhum conteúdo é produção real.