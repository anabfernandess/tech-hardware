(() => {
  "use strict";

  const CATEGORY_NAMES = {
    processadores: "Processadores",
    "placas-de-video": "Placas de Vídeo",
    "memoria-ram": "Memória RAM",
    ssd: "SSDs",
    "placas-mae": "Placas-mãe",
    fontes: "Fontes",
    gabinetes: "Gabinetes"
  };

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  let state = {
    category: "all",
    search: "",
    sort: "default",
    cart: loadCart()
  };

  const els = {
    grid: document.getElementById("productsGrid"),
    emptyState: document.getElementById("emptyState"),
    resultsInfo: document.getElementById("resultsInfo"),
    searchInput: document.getElementById("searchInput"),
    sortSelect: document.getElementById("sortSelect"),
    cartSidebar: document.getElementById("cartSidebar"),
    cartItems: document.getElementById("cartItems"),
    cartTotal: document.getElementById("cartTotal"),
    cartCount: document.getElementById("cartCount"),
    cartPreview: document.getElementById("cartPreview"),
    overlay: document.getElementById("overlay"),
    toast: document.getElementById("toast")
  };

  document.querySelectorAll(".cat-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".cat-pill.active").classList.remove("active");
      btn.classList.add("active");
      state.category = btn.dataset.category;
      render();
    });
  });

  els.searchInput.addEventListener("input", (e) => {
    state.search = e.target.value.trim().toLowerCase();
    render();
  });

  els.sortSelect.addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });

  function categoryName(id) {
    return CATEGORY_NAMES[id] || id;
  }

  function filterProducts() {
    let list = [...PRODUCTS];

    if (state.category !== "all") {
      list = list.filter((p) => p.category === state.category);
    }

    if (state.search) {
      list = list.filter((p) => {
        const haystack = (p.name + " " + categoryName(p.category) + " " + p.specs.join(" ")).toLowerCase();
        return haystack.includes(state.search);
      });
    }

    switch (state.sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
        break;
    }

    return list;
  }

  function render() {
    const list = filterProducts();
    els.grid.innerHTML = "";

    list.forEach((p) => {
      els.grid.insertAdjacentHTML("beforeend", productCard(p));
    });

    els.grid.querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", () => {
        addToCart(Number(btn.dataset.add));
        flashButton(btn);
      });
    });

    els.emptyState.style.display = list.length ? "none" : "block";

    const total = PRODUCTS.length;
    const shown = list.length;
    els.resultsInfo.textContent =
      shown !== total
        ? `${shown} de ${total} item${total !== 1 ? "s" : ""} · ${state.category === "all" ? "Todas as categorias" : categoryName(state.category)}`
        : "Todos os itens";
  }

  function productCard(p) {
    const badgeHtml = p.badge
      ? `<span class="badge badge-${p.badge.toLowerCase() === "promo" ? "promo" : p.badge.toLowerCase() === "vendido" ? "vendido" : "top"}">${p.badge}</span>`
      : "";
    const oldPriceHtml = p.oldPrice
      ? `<s class="product-oldprice">${formatter.format(p.oldPrice)}</s>`
      : "";
    const discount =
      p.oldPrice
        ? `<span class="product-pay">à vista no Pix · ${Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}% off</span>`
        : `<span class="product-pay">até 12x de ${formatter.format(p.price / 12)}</span>`;

    return `
      <article class="product-card">
        <div class="product-media">
          ${badgeHtml}
          <i class="fa-solid ${p.icon}"></i>
        </div>
        <span class="product-category">${categoryName(p.category)}</span>
        <h3>${p.name}</h3>
        <div class="product-specs">
          ${p.specs.map((s) => `<span>${s}</span>`).join("")}
        </div>
        <div class="product-price-row">
          <span class="product-price">${formatter.format(p.price)}</span>
          ${oldPriceHtml}
        </div>
        ${discount}
        <button class="add-btn" data-add="${p.id}">
          <i class="fa-solid fa-cart-plus"></i> Adicionar ao carrinho
        </button>
      </article>`;
  }

  /* ===== Cart ===== */
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem("techhardware_cart")) || [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem("techhardware_cart", JSON.stringify(state.cart));
  }

  function findItem(id) {
    return state.cart.find((i) => i.id === id);
  }

  function addToCart(id) {
    const item = findItem(id);
    if (item) {
      item.qty += 1;
    } else {
      state.cart.push({ id, qty: 1 });
    }
    saveCart();
    renderCart();
    showToast("Produto adicionado ao carrinho!");
  }

  function changeQty(id, delta) {
    const item = findItem(id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      state.cart = state.cart.filter((i) => i.id !== id);
    }
    saveCart();
    renderCart();
  }

  function removeItem(id) {
    state.cart = state.cart.filter((i) => i.id !== id);
    saveCart();
    renderCart();
    showToast("Produto removido do carrinho.");
  }

  function clearCart() {
    state.cart = [];
    saveCart();
    renderCart();
    showToast("Carrinho limpo.");
  }

  function totalPrice() {
    return state.cart.reduce((acc, i) => {
      const p = PRODUCTS.find((x) => x.id === i.id);
      return acc + (p ? p.price * i.qty : 0);
    }, 0);
  }

  function renderCart() {
    const items = [...state.cart].reverse();
    const count = state.cart.reduce((a, i) => a + i.qty, 0);
    const total = totalPrice();

    els.cartCount.textContent = count;
    els.cartCount.classList.toggle("show", count > 0);
    els.cartTotal.textContent = formatter.format(total);

    if (!items.length) {
      els.cartItems.innerHTML = `
        <div class="cart-empty">
          <i class="fa-solid fa-cart-arrow-down"></i>
          Seu carrinho está vazio.<br />Adicione produtos para continuar.
        </div>`;
    } else {
      els.cartItems.innerHTML = items
        .map((i) => {
          const p = PRODUCTS.find((x) => x.id === i.id);
          if (!p) return "";
          return `
            <div class="cart-item">
              <div class="cart-item-icon"><i class="fa-solid ${p.icon}"></i></div>
              <div class="cart-item-info">
                <h4>${p.name}</h4>
                <span>${formatter.format(p.price)}</span>
              </div>
              <div class="qty-controls">
                <button data-dec="${i.id}" aria-label="Diminuir quantidade"><i class="fa-solid fa-minus"></i></button>
                <span>${i.qty}</span>
                <button data-inc="${i.id}" aria-label="Aumentar quantidade"><i class="fa-solid fa-plus"></i></button>
              </div>
              <button class="remove-item" data-remove="${i.id}" aria-label="Remover item"><i class="fa-solid fa-trash-can"></i></button>
            </div>`;
        })
        .join("");
    }

    els.cartItems.querySelectorAll("[data-inc]").forEach((b) =>
      b.addEventListener("click", () => changeQty(Number(b.dataset.inc), 1)));
    els.cartItems.querySelectorAll("[data-dec]").forEach((b) =>
      b.addEventListener("click", () => changeQty(Number(b.dataset.dec), -1)));
    els.cartItems.querySelectorAll("[data-remove]").forEach((b) =>
      b.addEventListener("click", () => removeItem(Number(b.dataset.remove))));

    renderPreview(count, total);
    window.dispatchEvent(new CustomEvent("shop:cart-changed"));
  }

  function renderPreview(count, total) {
    els.cartPreview.innerHTML = "";
    if (!count) {
      els.cartPreview.innerHTML = `<p class="cart-preview-empty">Carrinho vazio</p>`;
      return;
    }
    [...state.cart].slice(-3).forEach((i) => {
      const p = PRODUCTS.find((x) => x.id === i.id);
      if (!p) return;
      els.cartPreview.insertAdjacentHTML(
        "beforeend",
        `<div class="cart-preview-item"><span>${i.qty}x ${p.name}</span><span>${formatter.format(p.price * i.qty)}</span></div>`
      );
    });
    els.cartPreview.insertAdjacentHTML(
      "beforeend",
      `<div class="cart-preview-total">Total: ${formatter.format(total)}</div>`
    );
  }

  /* ===== Sidebar / preview / toast ===== */
  function openCart() {
    els.cartSidebar.classList.add("open");
    els.overlay.classList.add("show");
  }

  function closeCart() {
    els.cartSidebar.classList.remove("open");
    els.overlay.classList.remove("show");
  }

  document.getElementById("cartBtn").addEventListener("click", openCart);
  document.getElementById("closeCart").addEventListener("click", closeCart);
  document.getElementById("clearCartBtn").addEventListener("click", clearCart);
  els.overlay.addEventListener("click", () => {
    closeCart();
    els.cartPreview.classList.remove("show");
  });

  window.ShopAPI = {
    getCartItems: () => state.cart.map((i) => ({ id: i.id, qty: i.qty })),
    getSubtotal: () => totalPrice(),
    isCartEmpty: () => state.cart.length === 0,
    cartCount: () => state.cart.reduce((a, i) => a + i.qty, 0),
    findProduct: (id) => PRODUCTS.find((p) => p.id === Number(id)) || null,
    clearCart,
    closeCart,
    openCart,
    openCheckout: () => {
      if (typeof window.Checkout !== "undefined" && window.Checkout.open) {
        closeCart();
        window.Checkout.open();
      } else {
        showToast("Checkout indisponível no momento.");
      }
    }
  };

  const cartBtnContainer = document.querySelector(".cart-btn-container");
  cartBtnContainer.addEventListener("mouseenter", () => {
    if (state.cart.length) els.cartPreview.classList.add("show");
  });
  cartBtnContainer.addEventListener("mouseleave", () => {
    setTimeout(() => els.cartPreview.classList.remove("show"), 150);
  });

  document.getElementById("newsletterForm").addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.reset();
    showToast("Inscrição realizada! Fique de olho no seu e-mail.");
  });

  const goToCheckoutEl = document.getElementById("checkoutBtn");
  if (goToCheckoutEl) {
    goToCheckoutEl.addEventListener("click", () => window.ShopAPI.openCheckout());
  }

  let toastTimer;
  function showToast(msg) {
    els.toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${msg}`;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2600);
  }

  function flashButton(btn) {
    const original = btn.innerHTML;
    btn.classList.add("added");
    btn.innerHTML = `<i class="fa-solid fa-check"></i> Adicionado!`;
    setTimeout(() => {
      btn.classList.remove("added");
      btn.innerHTML = original;
    }, 1200);
  }

  render();
  renderCart();
})();