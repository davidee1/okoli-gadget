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

function initializeAccountPrompt() {
  const prompt = document.querySelector("[data-account-prompt]");
  const checkoutContent = document.querySelector("[data-checkout-content]");
  if (!prompt || !checkoutContent || checkoutContent.hidden) return;

  const accounts = new Map();
  const showScreen = (name) => {
    prompt.querySelectorAll("[data-account-screen], [data-account-form]").forEach((screen) => {
      screen.hidden = screen.getAttribute("data-account-screen") !== name
        && screen.getAttribute("data-account-form") !== name;
    });
  };
  const showMessage = (form, text) => {
    const message = form.querySelector("[data-account-message]");
    if (message) {
      message.textContent = text;
      message.hidden = false;
    }
  };

  prompt.querySelectorAll("[data-account-view]").forEach((button) => {
    button.addEventListener("click", () => showScreen(button.getAttribute("data-account-view")));
  });
  prompt.querySelectorAll("[data-account-back]").forEach((button) => {
    button.addEventListener("click", () => showScreen("welcome"));
  });

  const signInForm = prompt.querySelector('[data-account-form="sign-in"]');
  if (signInForm) {
    signInForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!signInForm.reportValidity()) return;
      const formData = new FormData(signInForm);
      const email = String(formData.get("email")).trim().toLowerCase();
      const account = accounts.get(email);
      if (!account || account.password !== formData.get("password")) {
        showMessage(signInForm, "That email and password do not match an account created in this page session.");
        return;
      }
      signInForm.reset();
      const greeting = prompt.querySelector("[data-account-greeting]");
      if (greeting) greeting.textContent = `Welcome back, ${account.name.trim().split(/\s+/)[0]}.`;
      showScreen("success");
    });
  }

  const createAccountForm = prompt.querySelector('[data-account-form="create-account"]');
  if (createAccountForm) {
    createAccountForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!createAccountForm.reportValidity()) return;
      const formData = new FormData(createAccountForm);
      const name = String(formData.get("name")).trim();
      const email = String(formData.get("email")).trim().toLowerCase();
      const password = formData.get("password");
      if (password !== formData.get("confirm-password")) {
        showMessage(createAccountForm, "Your passwords do not match.");
        return;
      }
      if (accounts.has(email)) {
        showMessage(createAccountForm, "An account with this email already exists in this page session. Please sign in.");
        return;
      }
      accounts.set(email, { name, password });
      createAccountForm.reset();
      const greeting = prompt.querySelector("[data-account-greeting]");
      if (greeting) greeting.textContent = `Welcome, ${name.split(/\s+/)[0]}.`;
      showScreen("success");
    });
  }

  prompt.querySelectorAll("[data-account-continue]").forEach((button) => {
    button.addEventListener("click", () => prompt.close());
  });
  prompt.addEventListener("cancel", (event) => event.preventDefault());
  prompt.showModal();
}

document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();
  initializeAccountPrompt();
  initializeCheckout();
});
