(() => {
  const currencyRates = { sar: 1, yer: 65, usd: 0.2667 };
  const currencyLabels = { sar: "\u0631.\u0633", yer: "\u0631.\u064A", usd: "$" };
  let activeCurrency = localStorage.getItem("sotool-currency") || "sar";
  const currencySelect = document.getElementById("currencySelect");
  const currencyToggle = document.getElementById("currencyToggle");
  const currencyShort = document.getElementById("currencyShort");
  const menuPop = document.getElementById("menuPop");
  const mpImg = document.getElementById("mpImg");
  const mpTitle = document.getElementById("mpTitle");
  const mpCat = document.getElementById("mpCat");
  const mpDesc = document.getElementById("mpDesc");
  const mpPrice = document.getElementById("mpPrice");
  const mpMeta = document.getElementById("mpMeta");
  const mpTags = document.getElementById("mpTags");
  const mpGallery = document.getElementById("mpGallery");
  const mpQty = document.getElementById("mpQty");
  let selectedCard = null;
  const menuImages = Array.from(document.querySelectorAll(".mcard")).map((card) => card.dataset.img || "").filter((src, index, arr) => Boolean(src) && arr.indexOf(src) === index);
  function numberPrice(value) {
    const match = String(value || "").replace(/,/g, "").match(/[0-9]+(?:\.[0-9]+)?/);
    return match ? Number(match[0]) : 0;
  }
  function priceText(sarPrice) {
    const value = sarPrice * currencyRates[activeCurrency];
    const rounded = activeCurrency === "yer" ? Math.round(value).toLocaleString("en-US") : value.toFixed(2);
    return `${rounded} ${currencyLabels[activeCurrency]}`;
  }
  function refreshPrices() {
    document.querySelectorAll(".mcard").forEach((card) => {
      const current = card.querySelector(".mprice");
      if (current) current.textContent = priceText(numberPrice(card.dataset.price));
      const old = card.querySelector(".mold");
      if (old && card.dataset.old) old.textContent = priceText(numberPrice(card.dataset.old));
    });
    if (selectedCard) mpPrice.textContent = priceText(numberPrice(selectedCard.dataset.price));
  }
  function openProduct(card) {
    selectedCard = card;
    const startIndex = Math.max(0, menuImages.indexOf(card.dataset.img || ""));
    const gallery = [card.dataset.img || "", menuImages[(startIndex + 1) % Math.max(menuImages.length, 1)], menuImages[(startIndex + 2) % Math.max(menuImages.length, 1)]].filter((src, index, arr) => Boolean(src) && arr.indexOf(src) === index);
    mpImg.src = gallery[0] || card.dataset.img || "";
    mpTitle.textContent = card.dataset.title || "\u0645\u0646\u062A\u062C \u0633\u0637\u0648\u0644";
    if (mpQty) mpQty.value = "1";
    mpCat.textContent = card.dataset.cat || "\u0645\u062E\u062A\u0627\u0631\u0627\u062A \u0633\u0637\u0648\u0644";
    mpDesc.textContent = card.dataset.desc || "\u0642\u0637\u0639\u0629 \u0645\u0646\u062A\u0642\u0627\u0629 \u0628\u0639\u0646\u0627\u064A\u0629 \u0645\u0646 \u0645\u062A\u062C\u0631 \u0633\u0637\u0648\u0644.";
    mpMeta.textContent = `\u0645\u062A\u0648\u0641\u0631 \u0627\u0644\u0622\u0646 \xB7 ${card.dataset.time || "15"} \u062F\u0642\u0627\u0626\u0642 \u062A\u062C\u0647\u064A\u0632 \xB7 ${card.dataset.reviews || "0"} \u062A\u0642\u064A\u064A\u0645`;
    mpTags.textContent = "\u0645\u0642\u0627\u0633\u0627\u062A XS \xB7 S \xB7 M \xB7 L \xB7 XL";
    mpGallery.innerHTML = gallery.map((src, index) => `<button class="mpthumb ${index === 0 ? "active" : ""}" data-src="${src}"><img src="${src}" alt="\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0646\u062A\u062C ${index + 1}"></button>`).join("");
    mpGallery.querySelectorAll(".mpthumb").forEach((btn) => btn.addEventListener("click", () => {
      mpImg.src = btn.dataset.src || "";
      mpGallery.querySelectorAll(".mpthumb").forEach((x) => x.classList.remove("active"));
      btn.classList.add("active");
    }));
    refreshPrices();
    menuPop == null ? void 0 : menuPop.classList.add("open");
  }
  document.querySelectorAll(".mcard").forEach((card) => {
    card.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target == null ? void 0 : target.closest("button, a, input, select"))) openProduct(card);
    });
    const add = card.querySelector(".madd");
    if (add) add.addEventListener("click", (event) => {
      event.stopPropagation();
      openProduct(card);
    });
  });
  var _a;
  (_a = document.getElementById("mpClose")) == null ? void 0 : _a.addEventListener("click", () => menuPop == null ? void 0 : menuPop.classList.remove("open"));
  menuPop == null ? void 0 : menuPop.addEventListener("click", (event) => {
    if (event.target === menuPop) menuPop == null ? void 0 : menuPop.classList.remove("open");
  });
  function syncCurrencyUI() {
    if (currencySelect) currencySelect.value = activeCurrency;
    if (currencyShort) currencyShort.textContent = currencyLabels[activeCurrency];
  }
  currencySelect == null ? void 0 : currencySelect.addEventListener("change", (event) => {
    activeCurrency = event.target.value;
    localStorage.setItem("sotool-currency", activeCurrency);
    syncCurrencyUI();
    refreshPrices();
  });
  currencyToggle == null ? void 0 : currencyToggle.addEventListener("click", () => {
    const order = ["sar", "yer", "usd"];
    activeCurrency = order[(order.indexOf(activeCurrency) + 1) % order.length];
    localStorage.setItem("sotool-currency", activeCurrency);
    syncCurrencyUI();
    refreshPrices();
  });
  syncCurrencyUI();
  document.querySelectorAll(".mpsizes button").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll(".mpsizes button").forEach((x) => x.classList.remove("selected"));
    button.classList.add("selected");
  }));
  const clampQty = (value) => Math.min(99, Math.max(1, Number.isFinite(value) ? Math.round(value) : 1));
  var _a2;
  (_a2 = document.getElementById("mpQtyMinus")) == null ? void 0 : _a2.addEventListener("click", () => {
    if (mpQty) mpQty.value = String(clampQty(Number(mpQty.value) - 1));
  });
  var _a3;
  (_a3 = document.getElementById("mpQtyPlus")) == null ? void 0 : _a3.addEventListener("click", () => {
    if (mpQty) mpQty.value = String(clampQty(Number(mpQty.value) + 1));
  });
  mpQty == null ? void 0 : mpQty.addEventListener("change", () => {
    mpQty.value = String(clampQty(Number(mpQty.value)));
  });
  var _a4;
  (_a4 = document.getElementById("mpAddCart")) == null ? void 0 : _a4.addEventListener("click", () => {
    const button = document.getElementById("mpAddCart");
    if (!button) return;
    button.innerHTML = '<i class="fas fa-check"></i> \u062A\u0645\u062A \u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629';
    setTimeout(() => button.innerHTML = '<i class="fas fa-shopping-cart"></i> \u0623\u0636\u064A\u0641\u064A \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629', 1800);
  });
  const navToggle = document.querySelector(".navbar-toggler");
  const navMenu = document.getElementById("navmenu");
  const navBackdrop = document.getElementById("navBackdrop");
  function setMobileNav(open) {
    if (!navMenu || !navToggle || !navBackdrop) return;
    const isMobile = window.innerWidth < 992;
    const next = isMobile && open;
    navMenu.classList.toggle("show", next);
    navMenu.classList.toggle("mobile-open", next);
    navBackdrop.classList.toggle("show", next);
    navBackdrop.setAttribute("aria-hidden", String(!next));
    navToggle.setAttribute("aria-expanded", String(next));
    document.body.classList.toggle("nav-locked", next);
  }
  navToggle == null ? void 0 : navToggle.setAttribute("aria-expanded", "false");
  navToggle == null ? void 0 : navToggle.addEventListener("click", (event) => {
    event.preventDefault();
    setMobileNav(!(navMenu == null ? void 0 : navMenu.classList.contains("mobile-open")));
  });
  navBackdrop == null ? void 0 : navBackdrop.addEventListener("click", () => setMobileNav(false));
  navMenu == null ? void 0 : navMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMobileNav(false)));
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 992) setMobileNav(false);
  });
  const search = document.getElementById("navSearchBtn");
  const overlay = document.getElementById("searchOv");
  const close = document.getElementById("searchClose");
  search == null ? void 0 : search.addEventListener("click", () => {
    setMobileNav(false);
    overlay == null ? void 0 : overlay.classList.add("open");
  });
  close == null ? void 0 : close.addEventListener("click", () => overlay == null ? void 0 : overlay.classList.remove("open"));
  const cart = JSON.parse(localStorage.getItem("sotool-cart") || "[]");
  const cartFab = document.getElementById("cartFab");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");
  function persistCart() {
    localStorage.setItem("sotool-cart", JSON.stringify(cart));
    renderCart();
  }
  function renderCart() {
    if (!cartItems || !cartCount || !cartTotal) return;
    cartCount.textContent = String(cart.reduce((sum, item) => sum + item.qty, 0));
    cartTotal.textContent = priceText(cart.reduce((sum, item) => sum + item.price * item.qty, 0));
    if (!cart.length) {
      cartItems.innerHTML = '<p class="cart-empty">\u0627\u0644\u0633\u0644\u0629 \u0641\u0627\u0631\u063A\u0629 \u062D\u0627\u0644\u064A\u0627\u064B.</p>';
      return;
    }
    cartItems.innerHTML = cart.map((item, i) => `<div class="cart-row"><img src="${item.image}" alt="${item.title}"><div><strong>${item.title}</strong><small>\u0627\u0644\u0645\u0642\u0627\u0633: ${item.size} \xB7 ${priceText(item.price)} \u0644\u0644\u0642\u0637\u0639\u0629</small><div class="cart-qty"><button class="qty-minus" data-index="${i}" type="button">\u2212</button><span>${item.qty}</span><button class="qty-plus" data-index="${i}" type="button">+</button><button class="cart-remove" data-index="${i}" type="button">\u062D\u0630\u0641</button></div></div></div>`).join("");
    cartItems.querySelectorAll(".qty-minus").forEach((btn) => btn.addEventListener("click", () => {
      const item = cart[Number(btn.dataset.index)];
      if (item) item.qty = Math.max(1, item.qty - 1);
      persistCart();
    }));
    cartItems.querySelectorAll(".qty-plus").forEach((btn) => btn.addEventListener("click", () => {
      const item = cart[Number(btn.dataset.index)];
      if (item) item.qty = Math.min(99, item.qty + 1);
      persistCart();
    }));
    cartItems.querySelectorAll(".cart-remove").forEach((btn) => btn.addEventListener("click", () => {
      cart.splice(Number(btn.dataset.index), 1);
      persistCart();
    }));
  }
  function addToCart() {
    if (!selectedCard) return;
    const sizeButton = document.querySelector(".mpsizes button.selected");
    const size = (sizeButton == null ? void 0 : sizeButton.dataset.size) || "M";
    const price = numberPrice(selectedCard.dataset.price);
    const quantity = clampQty(Number((mpQty == null ? void 0 : mpQty.value) || 1));
    const existing = cart.find((item) => item.title === (selectedCard == null ? void 0 : selectedCard.dataset.title) && item.size === size);
    if (existing) existing.qty = Math.min(99, existing.qty + quantity);
    else cart.push({ title: selectedCard.dataset.title || "\u0645\u0646\u062A\u062C \u0633\u0637\u0648\u0644", price, image: selectedCard.dataset.img || "", size, qty: quantity });
    persistCart();
    menuPop == null ? void 0 : menuPop.classList.remove("open");
    cartDrawer == null ? void 0 : cartDrawer.classList.add("open");
  }
  var _a5;
  (_a5 = document.getElementById("mpAddCart")) == null ? void 0 : _a5.addEventListener("click", addToCart);
  cartFab == null ? void 0 : cartFab.addEventListener("click", () => cartDrawer == null ? void 0 : cartDrawer.classList.add("open"));
  var _a6;
  (_a6 = document.getElementById("cartClose")) == null ? void 0 : _a6.addEventListener("click", () => cartDrawer == null ? void 0 : cartDrawer.classList.remove("open"));
  function updateOrderPreview() {
    var _a12, _b, _c;
    const itemsEl = document.getElementById("orderPreviewItems");
    const totalEl = document.getElementById("orderPreviewTotal");
    const customerEl = document.getElementById("orderPreviewCustomer");
    if (!itemsEl || !totalEl || !customerEl) return;
    if (!cart.length) {
      itemsEl.innerHTML = '<p class="preview-empty">\u0623\u0636\u064A\u0641\u064A \u0645\u0646\u062A\u062C\u064B\u0627 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629 \u0644\u064A\u0638\u0647\u0631 \u0647\u0646\u0627.</p>';
      totalEl.textContent = priceText(0);
    } else {
      itemsEl.innerHTML = cart.map((item) => `<div class="preview-item"><img src="${item.image}" alt="${item.title}"><div><strong>${item.title}</strong><small>\u0627\u0644\u0645\u0642\u0627\u0633: ${item.size} \xB7 \u0627\u0644\u0643\u0645\u064A\u0629: ${item.qty}</small></div><b>${priceText(item.price * item.qty)}</b></div>`).join("");
      totalEl.textContent = priceText(cart.reduce((sum, item) => sum + item.price * item.qty, 0));
    }
    const name = (_a12 = document.getElementById("waName")) == null ? void 0 : _a12.value.trim();
    const phone = (_b = document.getElementById("waPhone")) == null ? void 0 : _b.value.trim();
    const address = (_c = document.getElementById("waAddress")) == null ? void 0 : _c.value.trim();
    const details = [name && `\u0627\u0644\u0627\u0633\u0645: ${name}`, phone && `\u0627\u0644\u0647\u0627\u062A\u0641: ${phone}`, address && `\u0627\u0644\u0639\u0646\u0648\u0627\u0646: ${address}`].filter(Boolean);
    customerEl.textContent = details.length ? details.join(" \xB7 ") : "\u0623\u0643\u0645\u0644\u064A \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0644\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062A\u0648\u0635\u064A\u0644.";
  }
  const checkoutModal = document.getElementById("checkoutModal");
  var _a7;
  (_a7 = document.getElementById("checkoutOpen")) == null ? void 0 : _a7.addEventListener("click", () => {
    if (cart.length) checkoutModal == null ? void 0 : checkoutModal.classList.add("open");
  });
  var _a8;
  (_a8 = document.getElementById("checkoutClose")) == null ? void 0 : _a8.addEventListener("click", () => checkoutModal == null ? void 0 : checkoutModal.classList.remove("open"));
  document.querySelectorAll("#waName, #waPhone, #waAddress, #waNotes").forEach((field) => field.addEventListener("input", updateOrderPreview));
  checkoutModal == null ? void 0 : checkoutModal.addEventListener("click", (event) => {
    if (event.target === checkoutModal) checkoutModal.classList.remove("open");
  });
  const successModal = document.getElementById("successModal");
  const closeSuccessModal = () => {
    successModal == null ? void 0 : successModal.classList.remove("open");
    successModal == null ? void 0 : successModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("success-locked");
  };
  var _a9;
  (_a9 = document.getElementById("successClose")) == null ? void 0 : _a9.addEventListener("click", closeSuccessModal);
  var _a10;
  (_a10 = document.getElementById("successDone")) == null ? void 0 : _a10.addEventListener("click", closeSuccessModal);
  successModal == null ? void 0 : successModal.addEventListener("click", (event) => {
    if (event.target === successModal) closeSuccessModal();
  });
  var _a11;
  (_a11 = document.getElementById("whatsappForm")) == null ? void 0 : _a11.addEventListener("submit", (event) => {
    var _a12;
    event.preventDefault();
    if (!cart.length) return;
    const name = document.getElementById("waName").value.trim();
    const phone = document.getElementById("waPhone").value.trim();
    const address = document.getElementById("waAddress").value.trim();
    const notes = document.getElementById("waNotes").value.trim();
    const lines = cart.map((item) => `\u2022 ${item.title} \u2014 \u0627\u0644\u0645\u0642\u0627\u0633 ${item.size} \u2014 ${item.qty} \xD7 ${priceText(item.price)}`);
    const message = `\u0645\u0631\u062D\u0628\u0627\u064B \u0645\u062A\u062C\u0631 \u0633\u0637\u0648\u0644\u060C \u0623\u0631\u064A\u062F \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0637\u0644\u0628:
\u0627\u0644\u0627\u0633\u0645: ${name}
\u0627\u0644\u0647\u0627\u062A\u0641: ${phone}
\u0627\u0644\u0639\u0646\u0648\u0627\u0646: ${address}

\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A:
${lines.join("\n")}

\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A: ${(cartTotal == null ? void 0 : cartTotal.textContent) || ""}
\u0645\u0644\u0627\u062D\u0638\u0627\u062A: ${notes || "\u0644\u0627 \u062A\u0648\u062C\u062F"}`;
    window.open(`https://wa.me/967781797884?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    checkoutModal == null ? void 0 : checkoutModal.classList.remove("open");
    successModal == null ? void 0 : successModal.classList.add("open");
    successModal == null ? void 0 : successModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("success-locked");
    (_a12 = document.getElementById("successDone")) == null ? void 0 : _a12.focus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSuccessModal();
  });
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const sortSelect = document.getElementById("sortSelect");
  const mgrid = document.getElementById("mgrid");
  const searchInput = document.getElementById("searchInput");
  const searchStatus = document.getElementById("searchStatus");
  let activeFilter = "all";
  let searchQuery = "";
  function applyCatalogView() {
    if (!mgrid) return;
    const items = Array.from(mgrid.querySelectorAll(".mwrap")).map((wrapper) => ({ wrapper, card: wrapper.querySelector(".mcard") })).filter((item) => item.card);
    items.forEach(({ wrapper, card }) => {
      const haystack = `${(card == null ? void 0 : card.dataset.title) || ""} ${(card == null ? void 0 : card.dataset.cat) || ""} ${(card == null ? void 0 : card.dataset.tags) || ""}`.toLocaleLowerCase();
      const matchesCategory = activeFilter === "all" || (card == null ? void 0 : card.dataset.audience) === activeFilter;
      const matchesSearch = !searchQuery || haystack.includes(searchQuery);
      wrapper.style.display = matchesCategory && matchesSearch ? "" : "none";
    });
    const visible = items.filter((item) => item.wrapper.style.display !== "none");
    const sort = (sortSelect == null ? void 0 : sortSelect.value) || "default";
    if (sort !== "default") visible.sort((a, b) => {
      var _a12, _b;
      const diff = numberPrice((_a12 = a.card) == null ? void 0 : _a12.dataset.price) - numberPrice((_b = b.card) == null ? void 0 : _b.dataset.price);
      return sort === "low" ? diff : -diff;
    });
    if (searchStatus) {
      searchStatus.textContent = searchQuery ? `${visible.length} \u0645\u0646\u062A\u062C \u0645\u0637\u0627\u0628\u0642 \u0644\u0644\u0628\u062D\u062B` : "\u0627\u0643\u062A\u0628\u064A \u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062A\u062C \u0623\u0648 \u0627\u0644\u0641\u0626\u0629 \u0644\u0644\u0628\u062D\u062B \u0627\u0644\u0633\u0631\u064A\u0639";
      searchStatus.classList.toggle("empty", visible.length === 0);
    }
    [...visible, ...items.filter((item) => item.wrapper.style.display === "none")].forEach((item) => mgrid.appendChild(item.wrapper));
  }
  filterButtons.forEach((button) => button.addEventListener("click", () => {
    activeFilter = button.dataset.filter || "all";
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    applyCatalogView();
  }));
  sortSelect == null ? void 0 : sortSelect.addEventListener("change", applyCatalogView);
  searchInput == null ? void 0 : searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.trim().toLocaleLowerCase();
    applyCatalogView();
  });
  document.querySelectorAll(".mcard").forEach((card) => {
    var _a12;
    card.style.position = "relative";
    if ((_a12 = card.dataset.tags) == null ? void 0 : _a12.includes("\u062C\u062F\u064A\u062F")) card.insertAdjacentHTML("afterbegin", '<span class="new-badge">\u062C\u062F\u064A\u062F</span>');
    const fav = document.createElement("button");
    fav.className = "fav-btn";
    fav.type = "button";
    fav.setAttribute("aria-label", "\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u0645\u0641\u0636\u0644\u0629");
    fav.textContent = localStorage.getItem(`fav-${card.dataset.title}`) === "1" ? "\u2665" : "\u2661";
    fav.addEventListener("click", (event) => {
      event.stopPropagation();
      const key = `fav-${card.dataset.title}`;
      const next = localStorage.getItem(key) === "1" ? "0" : "1";
      localStorage.setItem(key, next);
      fav.textContent = next === "1" ? "\u2665" : "\u2661";
    });
    card.prepend(fav);
  });
  refreshPrices();
  renderCart();
  updateOrderPreview();
  applyCatalogView();
  (function() {
    "use strict";
    var selectors = [
      { selector: "#navmenu", axis: "x", direction: "forward", close: function() {
        var _a12;
        (_a12 = document.querySelector(".navbar-toggler")) == null ? void 0 : _a12.click();
      } },
      { selector: "#menuPop", axis: "y", direction: "forward", close: function() {
        var _a12;
        (_a12 = document.getElementById("mpClose")) == null ? void 0 : _a12.click();
      } },
      { selector: "#cartDrawer", axis: "x", direction: "forward", close: function() {
        var _a12;
        (_a12 = document.getElementById("cartClose")) == null ? void 0 : _a12.click();
      } },
      { selector: "#checkoutModal", axis: "y", direction: "down", close: function() {
        var _a12;
        (_a12 = document.getElementById("checkoutClose")) == null ? void 0 : _a12.click();
      } },
      { selector: "#successModal", axis: "y", direction: "down", close: function() {
        var _a12;
        (_a12 = document.getElementById("successDone")) == null ? void 0 : _a12.click();
      } }
    ];
    function isOpen(el) {
      return el && (el.classList.contains("open") || el.classList.contains("show") || el.classList.contains("mobile-open"));
    }
    function bind(el, config) {
      if (!el || el.dataset.touchMotionBound === "1") return;
      el.dataset.touchMotionBound = "1";
      var startX = 0, startY = 0, lastX = 0, lastY = 0, tracking = false;
      var threshold = 64;
      el.addEventListener("touchstart", function(event) {
        if (!isOpen(el) || !event.touches[0]) return;
        startX = lastX = event.touches[0].clientX;
        startY = lastY = event.touches[0].clientY;
        tracking = true;
        el.classList.add("touch-dragging");
      }, { passive: true });
      el.addEventListener("touchmove", function(event) {
        if (!tracking || !event.touches[0]) return;
        lastX = event.touches[0].clientX;
        lastY = event.touches[0].clientY;
      }, { passive: true });
      el.addEventListener("touchend", function() {
        if (!tracking) return;
        tracking = false;
        el.classList.remove("touch-dragging");
        var dx = lastX - startX;
        var dy = lastY - startY;
        var distance = config.axis === "x" ? dx : dy;
        var shouldClose = config.direction === "forward" ? distance > threshold : distance > threshold;
        if (shouldClose) config.close();
      }, { passive: true });
    }
    function init() {
      selectors.forEach(function(config) {
        bind(document.querySelector(config.selector), config);
      });
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  })();
})();
