# Tech Hardware 🖥️

<p>
  <img src="https://cdn.simpleicons.org/html5/E34F26" alt="HTML5" width="40" height="40">
  &nbsp;
  <img src="https://cdn.simpleicons.org/css/1572B6" alt="CSS" width="40" height="40">
  &nbsp;
  <img src="https://cdn.simpleicons.org/javascript/F7DF1E" alt="JavaScript" width="40" height="40">
</p>

Loja virtual responsiva de componentes de hardware, com catálogo interativo, carrinho persistente e checkout em etapas.

Projeto de portfólio de **Beatriz Fernandes**, estudante de Engenharia de Software.

> Projeto demonstrativo: pagamentos, fretes e pedidos são simulados. Nenhuma compra ou cobrança real é realizada.

## Sobre o projeto

O Tech Hardware reúne a experiência de navegação e compra de uma loja de componentes de computador em uma única página.

O catálogo inclui processadores, placas de vídeo, memórias RAM, SSDs, placas-mãe, fontes e gabinetes. O usuário pode pesquisar produtos, filtrar categorias, montar seu carrinho e percorrer um checkout com validações e consulta de endereço pelo CEP.

A aplicação utiliza HTML, CSS e JavaScript puro, sem frameworks, backend ou banco de dados.

## Tecnologias

| Tecnologia | Aplicação no projeto |
|---|---|
| **HTML5** | Estrutura da página, formulários e conteúdo |
| **CSS** | Estilização, variáveis, Grid, Flexbox, animações e responsividade |
| **JavaScript ES6+** | Catálogo, busca, filtros, carrinho, validações e checkout |
| **localStorage** | Persistência do carrinho no navegador |
| **Fetch API** | Requisições para consulta de CEP |
| **ViaCEP** | Consulta de endereço a partir do CEP |
| **Font Awesome 6** | Ícones da interface |
| **Google Fonts — Inter** | Tipografia |

## Funcionalidades

### Catálogo

- Exibição de 24 produtos distribuídos em 7 categorias.
- Filtro por categoria.
- Busca em tempo real por nome, categoria e especificações.
- Ordenação por relevância, menor preço, maior preço e nome.
- Cards com preços, especificações e selos.
- Contagem dos resultados encontrados.

### Carrinho

- Painel lateral com os produtos selecionados.
- Controles para aumentar e diminuir quantidades.
- Remoção individual de produtos e limpeza do carrinho.
- Indicador da quantidade total de itens.
- Prévia dos últimos três itens ao passar o mouse sobre o carrinho.
- Cálculo automático do subtotal.
- Persistência dos itens ao recarregar ou reabrir a página.

### Checkout

O processo é organizado em cinco etapas, seguidas da confirmação:

1. **Dados do cliente:** nome, e-mail e telefone com máscara.
2. **Endereço:** CEP com consulta ao ViaCEP e preenchimento manual disponível.
3. **Entrega:** escolha entre três opções de frete e prazo simulados.
4. **Pagamento:** seleção de Pix ou cartão, sem solicitar dados reais de cartão.
5. **Revisão:** conferência dos produtos, dados informados e valores.
6. **Confirmação:** apresentação de um número demonstrativo de pedido e seu resumo.

O fluxo também inclui:

- Validação dos campos obrigatórios.
- Mensagens de erro próximas aos campos.
- Máscaras de telefone e CEP.
- Preservação dos dados ao retornar às etapas anteriores.
- Bloqueio da finalização com carrinho vazio.
- Frete gratuito para subtotal igual ou superior a R$ 500.
- Atualização do total conforme a entrega selecionada.
- Limpeza do carrinho somente após a confirmação.

### Interface

- Layout responsivo para diferentes tamanhos de tela.
- Notificações de feedback para ações e erros.
- Formulário demonstrativo de newsletter.
- Rodapé com informações institucionais fictícias.

## Como executar

### Abrindo diretamente no navegador

1. Baixe este repositório e extraia os arquivos.
2. Abra a pasta do projeto.
3. Abra o arquivo `index.html` no navegador.

Não é necessário instalar dependências para essa opção.

### Usando um servidor local

Com Git e Python instalados, execute:

```bash
git clone https://github.com/anabfernandess/tech-hardware.git
cd tech-hardware
python -m http.server 8080
```

Depois, acesse:

http://localhost:8080

Também é possível abrir a pasta no VS Code e utilizar a extensão **Live Server**.

> A consulta ao ViaCEP, os ícones e a fonte externa dependem de internet. Se a consulta de CEP falhar, o endereço pode ser preenchido manualmente.

## Estrutura do projeto

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura da vitrine, carrinho e checkout |
| `css/styles.css` | Tema visual, componentes e responsividade |
| `js/products.js` | Dados e especificações dos produtos |
| `js/script.js` | Catálogo, pesquisa, filtros, ordenação e carrinho |
| `js/checkout.js` | Etapas do checkout, validações, ViaCEP e confirmação |
| `README.md` | Apresentação e instruções de execução |
| `DOCUMENTACAO.md` | Documentação técnica e roteiro de estudo |

## Armazenamento e integrações

O carrinho é salvo no `localStorage` do navegador, utilizando a chave `techhardware_cart`.

A aplicação consulta o ViaCEP para buscar o endereço correspondente ao CEP informado. Se o serviço estiver indisponível ou o CEP não for encontrado, o preenchimento manual permanece disponível.

Não há backend ou banco de dados para registrar pedidos. A confirmação apresentada ao usuário faz parte da demonstração.

## Limites da demonstração

| Recurso | Comportamento |
|---|---|
| **Pagamento** | Pix, QR Code, código copia e cola e parcelamento são fictícios. Nenhuma cobrança é realizada. |
| **Entrega** | Os valores e prazos são predefinidos, sem integração com transportadoras. |
| **Frete grátis** | A regra de subtotal ≥ R$ 500 é aplicada aos cálculos da demonstração. |
| **Pedido** | O número gerado é ilustrativo. Não há envio para um sistema de vendas. |
| **Desconto nos cards** | O percentual exibido é informativo, calculado sobre o preço antigo. Não gera um desconto adicional no checkout. |
| **Newsletter** | Exibe feedback na interface, sem cadastrar ou enviar e-mails. |
| **Dados institucionais** | Contatos, endereço, CNPJ e links do rodapé são demonstrativos. |

## Aprendizado

O projeto serve como base de estudo para:

- Estruturação de interfaces com HTML.
- Layouts responsivos com CSS Grid e Flexbox.
- Manipulação do DOM e eventos em JavaScript.
- Organização de dados e separação de responsabilidades.
- Persistência local com `localStorage`.
- Consumo de APIs com `fetch` e `async/await`.
- Validação de formulários e navegação entre etapas.
- Testes de interação e experiência de uso.

## Documentação técnica

Consulte a [documentação do projeto](./DOCUMENTACAO.md) para entender o funcionamento dos arquivos, as regras do carrinho e checkout, os testes registrados e os pontos de personalização.

## Autora

**Beatriz Fernandes**  
Estudante de Engenharia de Software.

Responsável pela definição dos requisitos, direcionamento do desenvolvimento e testes manuais de navegação, responsividade e checkout.

Projeto desenvolvido com apoio de ferramentas de IA.

[Meu GitHub](https://github.com/anabfernandess)
