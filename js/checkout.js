(() => {
  "use strict";

  const FREE_SHIPPING_AT = 500;

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  const SHIPPING_OPTIONS = [
    { id: "economica", name: "Econômica", price: 24.9, days: "7–10 dias úteis", icon: "fa-truck" },
    { id: "padrao", name: "Padrão", price: 39.9, days: "3–5 dias úteis", icon: "fa-truck-fast" },
    { id: "expressa", name: "Expressa", price: 69.9, days: "1–2 dias úteis", icon: "fa-bolt" }
  ];

  const PAYMENT_OPTIONS = [
    { id: "pix", name: "Pix à vista", desc: "Pagamento instantâneo (simulado)", icon: "fa-qrcode" },
    { id: "cartao", name: "Cartão de crédito", desc: "Até 12x sem juros (simulado)", icon: "fa-credit-card" }
  ];

  const UFS = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
    "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  const defaultData = {
    nome: "", email: "", telefone: "",
    cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "",
    shipping: "padrao",
    payment: "pix"
  };

  const state = {
    step: 1,
    data: { ...defaultData },
    receipt: null,
    finished: false
  };

  const els = {
    overlay: document.getElementById("checkoutOverlay"),
    progress: document.getElementById("checkoutProgress"),
    body: document.getElementById("checkoutBody"),
    footer: document.getElementById("checkoutFooter"),
    toast: document.getElementById("toast")
  };

  function shop() {
    return window.ShopAPI;
  }

  function subtotal() {
    return shop() ? shop().getSubtotal() : 0;
  }

  function cartItems() {
    return shop() ? shop().getCartItems() : [];
  }

  function shippingPrice() {
    if (subtotal() >= FREE_SHIPPING_AT) return 0;
    const opt = SHIPPING_OPTIONS.find((o) => o.id === state.data.shipping) || SHIPPING_OPTIONS[1];
    return opt.price;
  }

  function totalPrice() {
    return subtotal() + shippingPrice();
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ===== Open / close ===== */
  function open() {
    if (!shop() || shop().isCartEmpty()) {
      showToast("Adicione produtos ao carrinho antes de finalizar.");
      return;
    }
    if (!state.finished) state.step = 1;
    els.overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    render();
  }

  function close() {
    els.overlay.classList.remove("open");
    document.body.style.overflow = "";
    if (state.finished) resetState();
  }

  function resetState() {
    state.step = 1;
    state.receipt = null;
    state.finished = false;
    state.data = { ...defaultData };
  }

  function scrollBodyTop() {
    els.body.scrollTop = 0;
  }

  let toastTimer;
  function showToast(msg) {
    els.toast.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${msg}`;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2600);
  }

  /* ===== Render ===== */
  function render() {
    renderProgress();
    renderBody();
    renderFooter();
  }

  function renderProgress() {
    if (state.step === 6) {
      els.progress.innerHTML = "";
      return;
    }
    const labels = ["Dados", "Endereço", "Entrega", "Pagamento", "Revisão"];
    els.progress.innerHTML = labels
      .map((label, i) => {
        const n = i + 1;
        const done = n < state.step;
        const cls = done ? "done" : n === state.step ? "active" : "";
        const num = done ? `<i class="fa-solid fa-check"></i>` : n;
        return `<li class="step ${cls}"><span class="step-num">${num}</span><span class="step-label">${label}</span></li>`;
      })
      .join("");
  }

  function renderBody() {
    switch (state.step) {
      case 1:
        els.body.innerHTML = stepDados();
        break;
      case 2:
        els.body.innerHTML = stepEndereco();
        break;
      case 3:
        els.body.innerHTML = stepEntrega();
        break;
      case 4:
        els.body.innerHTML = stepPagamento();
        break;
      case 5:
        els.body.innerHTML = stepRevisao();
        break;
      case 6:
        els.body.innerHTML = stepConfirmacao();
        break;
    }
    bindStep();
  }

  function renderFooter() {
    if (state.step === 6) {
      els.footer.innerHTML = `
        <button class="btn btn-primary btn-block" id="coBackToStore">
          <i class="fa-solid fa-store"></i> Voltar à loja
        </button>`;
      els.footer.querySelector("#coBackToStore").addEventListener("click", close);
      return;
    }

    const isLast = state.step === 5;
    els.footer.innerHTML = `
      ${state.step > 1 ? `<button class="btn btn-ghost" id="coBack"><i class="fa-solid fa-arrow-left"></i> Voltar</button>` : ""}
      <div class="footer-group">
        <button class="btn btn-primary" id="coNext">
          ${isLast ? `<i class="fa-solid fa-circle-check"></i> Confirmar pedido` : `Continuar <i class="fa-solid fa-arrow-right"></i>`}
        </button>
      </div>`;

    const back = els.footer.querySelector("#coBack");
    if (back) back.addEventListener("click", backStep);
    els.footer.querySelector("#coNext").addEventListener("click", nextStep);
  }

  /* ===== Summary aside ===== */
  function summaryAside() {
    const items = cartItems();
    const sub = subtotal();
    const ship = shippingPrice();
    const totalV = sub + ship;

    const itemHtml = items.length
      ? items.map((i) => {
          const p = shop().findProduct(i.id);
          if (!p) return "";
          return `<div class="co-summary-item">
            <span class="q">${i.qty}</span>
            <span class="name">${esc(p.name)}</span>
            <span class="sub">${formatter.format(p.price * i.qty)}</span>
          </div>`;
        }).join("")
      : `<div class="co-summary-item"><span class="name">Carrinho vazio</span></div>`;

    return `
      <aside class="co-summary">
        <h4><i class="fa-solid fa-cart-shopping"></i> Resumo do pedido</h4>
        ${itemHtml}
        <div class="ship-total-line">Frete: <strong>${ship === 0 ? "Grátis" : formatter.format(ship)}</strong></div>
        <div class="co-summary-total"><span>Total</span><span>${formatter.format(totalV)}</span></div>
        <div class="co-summary-meta"><i class="fa-solid fa-lock"></i> Checkout demonstrativo — nenhuma cobrança real.</div>
      </aside>`;
  }

  /* ===== Steps ===== */
  function stepDados() {
    return `
      <h3>Dados do cliente</h3>
      <p class="step-hint">Quem vai receber o pedido e o contato para acompanhamento.</p>
      <div class="co-layout">
        <div class="co-form-area">
          <div class="field">
            <label for="coNome">Nome completo <span class="req">*</span></label>
            <input type="text" id="coNome" value="${esc(state.data.nome)}" placeholder="Maria da Silva" autocomplete="name" />
            <p class="field-error"></p>
          </div>
          <div class="form-grid">
            <div class="field">
              <label for="coEmail">E-mail <span class="req">*</span></label>
              <input type="email" id="coEmail" value="${esc(state.data.email)}" placeholder="voce@email.com" autocomplete="email" />
              <p class="field-error"></p>
            </div>
            <div class="field">
              <label for="coTelefone">Telefone / WhatsApp <span class="req">*</span></label>
              <input type="tel" id="coTelefone" value="${esc(state.data.telefone)}" placeholder="(11) 98765-4321" autocomplete="tel" maxlength="15" />
              <p class="field-error"></p>
            </div>
          </div>
        </div>
        ${summaryAside()}
      </div>`;
  }

  function stepEndereco() {
    return `
      <h3>Endereço de entrega</h3>
      <p class="step-hint">Digite o CEP para preencher automaticamente (consulta ViaCEP).</p>
      <div class="co-layout">
        <div class="co-form-area">
          <div class="cep-row">
            <div class="field">
              <label for="coCep">CEP <span class="req">*</span></label>
              <input type="text" id="coCep" value="${esc(state.data.cep)}" placeholder="00000-000" maxlength="9" inputmode="numeric" />
              <p class="field-error"></p>
            </div>
            <span class="cep-status" id="cepStatus"></span>
          </div>
          <div class="form-grid">
            <div class="field">
              <label for="coRua">Rua <span class="req">*</span></label>
              <input type="text" id="coRua" value="${esc(state.data.rua)}" placeholder="Av. Paulista" autocomplete="street-address" />
              <p class="field-error"></p>
            </div>
            <div class="field">
              <label for="coNumero">Número <span class="req">*</span></label>
              <input type="text" id="coNumero" value="${esc(state.data.numero)}" placeholder="1000" inputmode="numeric" />
              <p class="field-error"></p>
            </div>
            <div class="field full">
              <label for="coComplemento">Complemento</label>
              <input type="text" id="coComplemento" value="${esc(state.data.complemento)}" placeholder="Apto, bloco... (opcional)" />
            </div>
            <div class="field">
              <label for="coBairro">Bairro <span class="req">*</span></label>
              <input type="text" id="coBairro" value="${esc(state.data.bairro)}" />
              <p class="field-error"></p>
            </div>
            <div class="field">
              <label for="coUf">Estado <span class="req">*</span></label>
              <select id="coUf">
                <option value="">Selecione...</option>
                ${UFS.map((u) => `<option value="${u}" ${state.data.uf === u ? "selected" : ""}>${u}</option>`).join("")}
              </select>
              <p class="field-error"></p>
            </div>
            <div class="field full">
              <label for="coCidade">Cidade <span class="req">*</span></label>
              <input type="text" id="coCidade" value="${esc(state.data.cidade)}" />
              <p class="field-error"></p>
            </div>
          </div>
        </div>
        ${summaryAside()}
      </div>`;
  }

  function stepEntrega() {
    const sub = subtotal();
    const free = sub >= FREE_SHIPPING_AT;
    const notice = free
      ? `<div class="co-free-shipping"><i class="fa-solid fa-truck-fast"></i> Subtotal de ${formatter.format(sub)} — frete grátis aplicado! (acima de ${formatter.format(FREE_SHIPPING_AT)})</div>`
      : `<div class="co-free-shipping info"><i class="fa-solid fa-circle-info"></i> Adicione ${formatter.format(FREE_SHIPPING_AT - sub)} em produtos para ganhar <strong>frete grátis</strong>.</div>`;

    const options = SHIPPING_OPTIONS.map((o) => {
      const priceHtml = free
        ? `<strong class="free"><i class="fa-solid fa-gift"></i> Grátis</strong><span class="old">${formatter.format(o.price)}</span>`
        : `<strong>${formatter.format(o.price)}</strong>`;
      return `
        <label class="option-card ${state.data.shipping === o.id ? "selected" : ""}">
          <input type="radio" name="coShipping" value="${o.id}" ${state.data.shipping === o.id ? "checked" : ""} />
          <span class="option-radio"></span>
          <span class="option-icon"><i class="fa-solid ${o.icon}"></i></span>
          <span class="option-info">
            <span class="option-name">${o.name}</span>
            <span class="option-desc">Prazo estimado: ${o.days}</span>
          </span>
          <span class="option-price">${priceHtml}</span>
        </label>`;
    }).join("");

    return `
      <h3>Forma de entrega</h3>
      <p class="step-hint">Prazos e valores de frete simulados. Escolha a modalidade desejada.</p>
      ${notice}
      <div class="co-layout">
        <div class="co-form-area">
          <div class="option-list">${options}</div>
        </div>
        ${summaryAside()}
      </div>`;
  }

  function stepPagamento() {
    const totalV = totalPrice();
    const each = totalV / 12;

    const cards = PAYMENT_OPTIONS.map((p) => `
      <label class="option-card ${state.data.payment === p.id ? "selected" : ""}">
        <input type="radio" name="coPayment" value="${p.id}" ${state.data.payment === p.id ? "checked" : ""} />
        <span class="option-radio"></span>
        <span class="option-icon"><i class="fa-solid ${p.icon}"></i></span>
        <span class="option-info">
          <span class="option-name">${p.name}</span>
          <span class="option-desc">${p.desc}</span>
        </span>
        <span class="option-price">
          ${p.id === "cartao" ? `<strong>${formatter.format(each)}</strong><span class="old">12x sem juros</span>` : ""}
        </span>
      </label>`).join("");

    return `
      <h3>Forma de pagamento</h3>
      <p class="step-hint">Simulação apenas — nenhum dado real de cartão ou Pix é solicitado.</p>
      <div class="co-layout">
        <div class="co-form-area">
          <div class="option-list">${cards}</div>
          <div class="payment-detail" id="paymentDetail"></div>
        </div>
        ${summaryAside()}
      </div>`;
  }

  function renderPaymentDetail() {
    const box = document.getElementById("paymentDetail");
    if (!box) return;
    const totalV = totalPrice();

    if (state.data.payment === "pix") {
      box.innerHTML = `
        <div class="pay-detail">
          <div class="pay-detail-title"><i class="fa-solid fa-qrcode"></i> Simulação de QR Code Pix</div>
          <div class="pix-box">
            <div class="pix-qr"><i class="fa-solid fa-qrcode"></i></div>
            <div class="pix-code">00020126580014BR.GOV.BCB.PIX0136DEMO-TECHHARDWARE-${String(Date.now() % 1e6).padStart(6, "0")}520400005303986$${scaled(totalV)}5802BR5925TECHHARDWARE-LTDA6009SAO-PAULO62070503***</div>
          </div>
          <p class="pix-hint">Chave Pix (simulada): vendas@techhardware.com.br · Nenhum pagamento real ocorrerá.</p>
        </div>`;
    } else {
      box.innerHTML = `
        <div class="pay-detail">
          <div class="pay-detail-title"><i class="fa-solid fa-credit-card"></i> Simulação de parcelamento</div>
          <p>Cartão de crédito (simulado): <strong>${formatter.format(totalV)}</strong> em até <strong>12x de ${formatter.format(totalV / 12)}</strong> sem juros. Nenhum dado de cartão é solicitado neste ambiente.</p>
        </div>`;
    }
  }

  function scaled(v) {
    return Math.round(v * 100).toString().padStart(8, "0");
  }

  function stepRevisao() {
    const items = cartItems();
    const sub = subtotal();
    const ship = shippingPrice();
    const totalV = sub + ship;
    const free = sub >= FREE_SHIPPING_AT;
    const shipOpt = SHIPPING_OPTIONS.find((o) => o.id === state.data.shipping) || SHIPPING_OPTIONS[1];
    const pay = PAYMENT_OPTIONS.find((p) => p.id === state.data.payment) || PAYMENT_OPTIONS[0];
    const count = shop() ? shop().cartCount() : 0;
    const d = state.data;

    const addressValue = `${d.rua}, ${d.numero}${d.complemento ? " - " + esc(d.complemento) : ""} · ${d.bairro} · ${d.cidade}/${d.uf} · CEP ${d.cep}`;

    return `
      <h3>Revise seu pedido</h3>
      <p class="step-hint">Confira tudo antes de confirmar. Nenhuma cobrança será realizada.</p>
      ${items.length === 0 ? `<div class="emptied-warning"><i class="fa-solid fa-triangle-exclamation"></i> Seu carrinho está vazio. Não é possível finalizar. Adicione produtos e retorne.</div>` : ""}
      <div class="review-block">
        <h4><i class="fa-solid fa-box"></i> Produtos (${count})</h4>
        <div class="review-products">
          ${items.map((i) => {
            const p = shop().findProduct(i.id);
            if (!p) return "";
            return `<div class="review-item">
              <span class="value">${esc(p.name)}<span class="qty-tag">×${i.qty}</span></span>
              <span class="value">${formatter.format(p.price * i.qty)}</span>
            </div>`;
          }).join("")}
        </div>
      </div>
      <div class="review-block">
        <h4><i class="fa-solid fa-user"></i> Dados do cliente</h4>
        <div class="review-item"><span class="label">Nome</span><span class="value">${esc(d.nome)}</span></div>
        <div class="review-item"><span class="label">E-mail</span><span class="value">${esc(d.email)}</span></div>
        <div class="review-item"><span class="label">Telefone</span><span class="value">${esc(d.telefone)}</span></div>
      </div>
      <div class="review-block">
        <h4><i class="fa-solid fa-location-dot"></i> Endereço de entrega</h4>
        <div class="review-item"><span class="value">${addressValue}</span></div>
      </div>
      <div class="review-block">
        <h4><i class="fa-solid fa-truck-fast"></i> Entrega</h4>
        <div class="review-item"><span class="label">${shipOpt.name}</span><span class="value">${shipOpt.days}</span></div>
        <div class="review-item"><span class="label">Frete</span><span class="value">${free ? "Grátis" : formatter.format(ship)}</span></div>
      </div>
      <div class="review-block">
        <h4><i class="fa-solid fa-credit-card"></i> Pagamento</h4>
        <div class="review-item">
          <span class="label">${pay.name}</span>
          <span class="value">${pay.id === "cartao" ? `até 12x de ${formatter.format(totalV / 12)} sem juros (simulado)` : "Pagamento instantâneo (simulado)"}</span>
        </div>
      </div>
      <div class="totals-box">
        <div class="line"><span>Subtotal</span><strong>${formatter.format(sub)}</strong></div>
        <div class="line"><span>Frete</span><strong>${free ? "Grátis" : formatter.format(ship)}</strong></div>
        <div class="line grand"><span>Total</span><strong>${formatter.format(totalV)}</strong></div>
      </div>`;
  }

  function stepConfirmacao() {
    const r = state.receipt || {};
    return `
      <div class="confirmation">
        <div class="check-icon"><i class="fa-solid fa-check"></i></div>
        <h3>Pedido confirmado!</h3>
        <p class="conf-sub">Seu pedido demonstrativo foi registrado. Obrigado pela preferência (simulada)!</p>
        <div class="order-number">${esc(r.number || "")}</div>
        <div class="conf-grid">
          <div class="conf-box"><div class="k">Total (simulado)</div><div class="v">${r.total != null ? formatter.format(r.total) : "-"}</div></div>
          <div class="conf-box"><div class="k">Pagamento</div><div class="v">${esc(r.payment || "-")}</div></div>
          <div class="conf-box"><div class="k">Entrega estimada</div><div class="v">${esc(r.delivery || "-")}</div></div>
        </div>
        <div class="demo-note">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div>
            <strong>Ambiente 100% demonstrativo.</strong> Nenhuma compra, cobrança ou pagamento real foi realizado, e nenhum dado bancário ou de cartão foi coletado.<br />
            O número de pedido exibido é apenas ilustrativo e não possui validade comercial.
          </div>
        </div>
      </div>`;
  }

  /* ===== Bind steps ===== */
  function bindStep() {
    if (state.step === 1) bindDados();
    if (state.step === 2) bindEndereco();
    if (state.step === 3) bindEntrega();
    if (state.step === 4) bindPagamento();
  }

  function bindLive(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    const onInput = () => {
      state.data[key] = el.value;
      clearErrorOnInput(el);
    };
    el.addEventListener("input", onInput);
    if (el.tagName === "SELECT") el.addEventListener("change", onInput);
  }

  function bindDados() {
    bindLive("coNome", "nome");
    bindLive("coEmail", "email");
    const phone = document.getElementById("coTelefone");
    phone.addEventListener("input", () => {
      const raw = phone.value.replace(/\D/g, "").slice(0, 11);
      phone.value = applyMaskPhone(raw);
      state.data.telefone = phone.value;
      clearErrorOnInput(phone);
    });
  }

  function bindEndereco() {
    const cep = document.getElementById("coCep");
    cep.addEventListener("input", () => {
      const raw = cep.value.replace(/\D/g, "").slice(0, 8);
      cep.value = applyMaskCep(raw);
      state.data.cep = cep.value;
      clearErrorOnInput(cep);
    });
    cep.addEventListener("blur", () => {
      if (cep.value.replace(/\D/g, "").length === 8) lookupCep();
    });
    cep.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const raw = cep.value.replace(/\D/g, "").slice(0, 8);
        cep.value = applyMaskCep(raw);
        state.data.cep = cep.value;
        lookupCep();
      }
    });

    bindLive("coRua", "rua");
    bindLive("coNumero", "numero");
    bindLive("coComplemento", "complemento");
    bindLive("coBairro", "bairro");
    bindLive("coCidade", "cidade");
    bindLive("coUf", "uf");
  }

  function bindEntrega() {
    bindOptions("coShipping", (val) => {
      state.data.shipping = val;
    });
  }

  function bindPagamento() {
    bindOptions("coPayment", (val) => {
      state.data.payment = val;
      renderPaymentDetail();
    });
    renderPaymentDetail();
  }

  function bindOptions(name, onChange) {
    document.querySelectorAll(`input[name="${name}"]`).forEach((r) => {
      r.addEventListener("change", () => {
        bindOptionsSelect(name);
        if (onChange) onChange(r.value);
      });
    });
  }

  function bindOptionsSelect(name) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    document.querySelectorAll(`input[name="${name}"]`).forEach((r) => {
      r.closest(".option-card").classList.toggle("selected", r === checked);
    });
  }

  /* ===== Masks & CEP ===== */
  function applyMaskPhone(d) {
    if (d.length === 0) return "";
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  function applyMaskCep(d) {
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
  }

  async function lookupCep() {
    const status = document.getElementById("cepStatus");
    const input = document.getElementById("coCep");
    const d = input.value.replace(/\D/g, "");
    if (d.length !== 8) {
      status.className = "cep-status fail";
      status.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> CEP incompleto`;
      return;
    }
    status.className = "cep-status loading";
    status.innerHTML = `<i class="fa-solid fa-spinner"></i> buscando endereço...`;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${d}/json/`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error("http");
      const data = await res.json();
      if (data.erro) {
        status.className = "cep-status fail";
        status.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> CEP não encontrado — preencha manualmente.`;
        return;
      }
      setField("coRua", data.logradouro);
      setField("coBairro", data.bairro);
      setField("coCidade", data.localidade);
      const uf = document.getElementById("coUf");
      if (uf) uf.value = data.uf;
      state.data.uf = data.uf;
      const cepField = document.getElementById("coCep").closest(".field");
      if (cepField) cepField.classList.remove("has-error");
      status.className = "cep-status ok";
      status.innerHTML = `<i class="fa-solid fa-circle-check"></i> Endereço preenchido`;
      const num = document.getElementById("coNumero");
      if (num) num.focus();
    } catch {
      status.className = "cep-status fail";
      status.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Não foi possível consultar — preencha manualmente.`;
    }
  }

  function setField(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = value;
    if (id === "coRua") state.data.rua = value;
    if (id === "coBairro") state.data.bairro = value;
    if (id === "coCidade") state.data.cidade = value;
  }

  /* ===== Validation ===== */
  function ruleFor(id, value) {
    switch (id) {
      case "coNome":
        return value.trim().length >= 3 ? "" : "Informe seu nome completo.";
      case "coEmail":
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? "" : "Informe um e-mail válido.";
      case "coTelefone":
        return value.replace(/\D/g, "").length >= 10 ? "" : "Telefone inválido — inclua o DDD.";
      case "coCep":
        return value.replace(/\D/g, "").length === 8 ? "" : "CEP inválido — use 8 dígitos.";
      case "coRua":
        return value.trim() ? "" : "Informe a rua.";
      case "coNumero":
        return value.trim() ? "" : "Informe o número.";
      case "coBairro":
        return value.trim() ? "" : "Informe o bairro.";
      case "coCidade":
        return value.trim() ? "" : "Informe a cidade.";
      case "coUf":
        return value ? "" : "Selecione o estado.";
      default:
        return "";
    }
  }

  function setFieldError(input, msg) {
    const group = input.closest(".field");
    if (!group) return;
    group.classList.toggle("has-error", !!msg);
    const err = group.querySelector(".field-error");
    if (err) err.textContent = msg || "";
    if (msg) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  function clearErrorOnInput(input) {
    const group = input.closest(".field");
    if (group && group.classList.contains("has-error")) {
      const msg = ruleFor(input.id, input.value);
      if (!msg) setFieldError(input, "");
    }
  }

  function checkFields(ids, container) {
    let ok = true;
    ids.forEach((id) => {
      const input = container.querySelector(`#${id}`);
      if (!input) return;
      const msg = ruleFor(input.id, input.value);
      setFieldError(input, msg);
      if (msg) ok = false;
    });
    return ok;
  }

  function validateStep(step) {
    if (step === 1) {
      return checkFields(["coNome", "coEmail", "coTelefone"], els.body);
    }
    if (step === 2) {
      return checkFields(["coCep", "coRua", "coNumero", "coBairro", "coCidade", "coUf"], els.body);
    }
    if (step === 5) {
      if (shop().isCartEmpty()) {
        showToast("Carrinho vazio — adicione produtos antes de finalizar.");
        return false;
      }
      return true;
    }
    return true;
  }

  /* ===== Navigation ===== */
  function nextStep() {
    if (!validateStep(state.step)) return;
    if (state.step === 5) {
      finalizeOrder();
      return;
    }
    state.step += 1;
    render();
    scrollBodyTop();
  }

  function backStep() {
    if (state.step > 1) {
      state.step -= 1;
      render();
      scrollBodyTop();
    }
  }

  function finalizeOrder() {
    if (shop().isCartEmpty()) {
      showToast("Carrinho vazio — não é possível finalizar.");
      return;
    }
    const pay = PAYMENT_OPTIONS.find((p) => p.id === state.data.payment) || PAYMENT_OPTIONS[0];
    const shipOpt = SHIPPING_OPTIONS.find((o) => o.id === state.data.shipping) || SHIPPING_OPTIONS[1];

    const totalV = subtotal() + shippingPrice();
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
    render();
    scrollBodyTop();
  }

  function generateOrderNumber() {
    const now = new Date();
    const stamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0")
    ].join("");
    const rand = String(Math.floor(10000 + Math.random() * 90000));
    return `TH-${stamp}-${rand}`;
  }

  /* ===== Global bindings ===== */
  document.getElementById("checkoutCloseBtn").addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && els.overlay.classList.contains("open")) close();
  });

  window.addEventListener("shop:cart-changed", () => {
    if (els.overlay.classList.contains("open") && state.step <= 4) {
      const summary = els.body.querySelector(".co-summary");
      if (summary) summary.outerHTML = summaryAside();
      if (state.step === 4) renderPaymentDetail();
    }
  });

  window.Checkout = { open, close };
})();