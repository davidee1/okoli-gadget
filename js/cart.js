function updateCart(items) {
  saveStorage(CART_KEY, items);
  updateCartCount();
  renderCartPage();
}

function renderCartPage() {
  const cartItemsContainer = document.querySelector("[data-cart-items]");
  const checkoutItemsContainer = document.querySelector("[data-checkout-items]");
  if (!cartItemsContainer && !checkoutItemsContainer) return;

  const cart = getCart().filter((item) => products.some((product) => product.id === item.id));
  const detailedItems = cart.map((item) => ({
    ...item,
    product: products.find((product) => product.id === item.id)
  }));
  const subtotal = detailedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const cartContent = document.querySelector("[data-cart-content]");
  const cartEmpty = document.querySelector("[data-cart-empty]");
  if (cartContent && cartEmpty) {
    cartContent.hidden = detailedItems.length === 0;
    cartEmpty.hidden = detailedItems.length > 0;
  }
  const checkoutContent = document.querySelector("[data-checkout-content]");
  const checkoutEmpty = document.querySelector("[data-checkout-empty]");
  if (checkoutContent && checkoutEmpty) {
    checkoutContent.hidden = detailedItems.length === 0;
    checkoutEmpty.hidden = detailedItems.length > 0;
  }

  if (cartItemsContainer) {
    cartItemsContainer.replaceChildren(...detailedItems.map((item) => {
      const row = document.createElement("article");
      row.className = "cart-item";
      row.innerHTML = `
        <a class="cart-product-image" href="products.html"><img src="${item.product.image}" alt="${item.product.name}"></a>
        <div class="cart-product-info"><span>${item.product.category}</span><h3>${item.product.name}</h3><strong>${formatPrice(item.product.price)}</strong><button class="remove-item" type="button" data-remove-item="${item.id}">Remove</button></div>
        <div class="quantity-control" aria-label="Quantity for ${item.product.name}"><button type="button" data-quantity-change="-1" data-item-id="${item.id}" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-quantity-change="1" data-item-id="${item.id}" aria-label="Increase quantity">+</button></div>
        <strong class="cart-line-total">${formatPrice(item.product.price * item.quantity)}</strong>`;
      return row;
    }));
    document.querySelectorAll("[data-cart-subtotal], [data-cart-total]").forEach((element) => {
      element.textContent = formatPrice(subtotal);
    });
  }

  if (checkoutItemsContainer) {
    checkoutItemsContainer.replaceChildren(...detailedItems.map((item) => {
      const row = document.createElement("div");
      row.className = "checkout-item";
      row.innerHTML = `<img src="${item.product.image}" alt=""><div><strong>${item.product.name}</strong><span>Qty ${item.quantity}</span></div><strong>${formatPrice(item.product.price * item.quantity)}</strong>`;
      return row;
    }));
    document.querySelectorAll("[data-checkout-subtotal], [data-checkout-total]").forEach((element) => {
      element.textContent = formatPrice(subtotal);
    });
  }
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const quantityButton = target.closest("[data-quantity-change]");
  if (quantityButton) {
    const itemId = quantityButton.getAttribute("data-item-id");
    const change = Number(quantityButton.getAttribute("data-quantity-change"));
    const cart = getCart();
    const item = cart.find((entry) => entry.id === itemId);
    if (item) {
      item.quantity += change;
      updateCart(cart.filter((entry) => entry.quantity > 0));
    }
  }
  const removeButton = target.closest("[data-remove-item]");
  if (removeButton) {
    const itemId = removeButton.getAttribute("data-remove-item");
    updateCart(getCart().filter((item) => item.id !== itemId));
    showToast("Item removed from your bag.");
  }
});

function initializeCheckout() {
  const form = document.querySelector("[data-checkout-form]");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const customerName = new FormData(form).get("name");
    const name = typeof customerName === "string" ? customerName.trim().split(/\s+/)[0] : "friend";
    const orderNumber = `OK-${Date.now().toString().slice(-7)}`;
    const confirmation = document.querySelector("[data-order-confirmation]");
    const checkoutContent = document.querySelector("[data-checkout-content]");
    const cart = document.querySelector("[data-cart-count]");
    const confirmationName = document.querySelector("[data-confirmation-name]");
    const confirmationNumber = document.querySelector("[data-order-number]");
    if (confirmationName) confirmationName.textContent = name || "friend";
    if (confirmationNumber) confirmationNumber.textContent = orderNumber;
    if (checkoutContent) checkoutContent.hidden = true;
    if (confirmation) confirmation.hidden = false;
    saveStorage(CART_KEY, []);
    if (cart) cart.textContent = "0";
    updateCartCount();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();
  initializeCheckout();
});
