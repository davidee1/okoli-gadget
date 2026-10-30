const CART_KEY = "theOkoliCart";
const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0
});

function formatPrice(price) {
  return currencyFormatter.format(price);
}

function readStorage(key, fallback) {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch (error) {
    console.error(`Could not read ${key} from local storage.`, error);
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not save ${key} to local storage.`, error);
    showToast("Your browser could not save this change.");
  }
}

function getCart() {
  const cart = readStorage(CART_KEY, []);
  return Array.isArray(cart) ? cart.filter((item) =>
    item && typeof item.id === "string" && Number.isInteger(item.quantity) && item.quantity > 0
  ) : [];
}

function updateCartCount() {
  const itemCount = getCart().reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((counter) => {
    counter.textContent = String(itemCount);
    counter.classList.toggle("has-items", itemCount > 0);
  });
}

function showToast(message) {
  const region = document.querySelector(".toast-region");
  if (!region) return;
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = message;
  region.append(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

function renderProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.innerHTML = `
    <div class="product-image-wrap">
      <a class="product-image-link" href="products.html" aria-label="View ${product.name}">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </a>
    </div>
    <div class="product-card-info">
      <div class="product-card-meta"><span>${product.category}</span><span class="product-rating"><span aria-hidden="true">★</span> ${product.rating.toFixed(1)}</span></div>
      <h3>${product.name}</h3>
      <div class="product-card-bottom"><strong>${formatPrice(product.price)}</strong><button class="add-button" type="button" data-add-to-cart="${product.id}" aria-label="Add ${product.name} to cart"><span aria-hidden="true">+</span><span>Add to bag</span></button></div>
    </div>`;
  return card;
}

function renderProductCollection(container, collection) {
  container.replaceChildren(...collection.map(renderProductCard));
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) {
    showToast("Sorry, that item is no longer available.");
    return;
  }
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) existingItem.quantity += 1;
  else cart.push({ id: productId, quantity: 1 });
  saveStorage(CART_KEY, cart);
  updateCartCount();
  showToast(`${product.name} added to your bag.`);
}

function initializeHeader() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      nav.classList.toggle("is-open", !isOpen);
    });
  }
  document.querySelectorAll(".header-search").forEach((form) => {
    const searchButton = form.querySelector("button");
    const searchInput = form.querySelector("input");
    if (searchButton && searchInput) {
      searchButton.addEventListener("click", (event) => {
        if (window.matchMedia("(max-width: 700px)").matches && !form.classList.contains("search-open")) {
          event.preventDefault();
          form.classList.add("search-open");
          searchInput.focus();
        }
      });
    }
  });
  const searchInput = document.querySelector("#site-search");
  if (searchInput && new URLSearchParams(window.location.search).has("search")) {
    searchInput.value = new URLSearchParams(window.location.search).get("search") || "";
  }
}

function initializeProductPage() {
  const grid = document.querySelector("[data-products-grid]");
  if (!grid) return;
  const categoryFilters = document.querySelector("[data-category-filters]");
  const sortSelect = document.querySelector("[data-product-sort]");
  const count = document.querySelector("[data-product-count]");
  const emptyState = document.querySelector("[data-products-empty]");
  const categories = ["All", ...new Set(products.map((product) => product.category))];
  const params = new URLSearchParams(window.location.search);
  let activeCategory = categories.includes(params.get("category")) ? params.get("category") : "All";
  let searchTerm = (params.get("search") || "").trim();

  if (categoryFilters) {
    categoryFilters.replaceChildren(...categories.map((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `filter-chip${category === activeCategory ? " is-selected" : ""}`;
      button.textContent = category;
      button.addEventListener("click", () => {
        activeCategory = category;
        categoryFilters.querySelectorAll(".filter-chip").forEach((chip) => {
          chip.classList.toggle("is-selected", chip.textContent === category);
        });
        updateProducts();
      });
      return button;
    }));
  }

  function updateProducts() {
    let visibleProducts = products.filter((product) => {
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    const sortOrder = sortSelect ? sortSelect.value : "featured";
    if (sortOrder === "price-low") visibleProducts.sort((a, b) => a.price - b.price);
    if (sortOrder === "price-high") visibleProducts.sort((a, b) => b.price - a.price);
    if (sortOrder === "rating") visibleProducts.sort((a, b) => b.rating - a.rating);
    if (sortOrder === "featured") visibleProducts.sort((a, b) => Number(b.featured) - Number(a.featured));
    renderProductCollection(grid, visibleProducts);
    if (count) count.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? "piece" : "pieces"}`;
    if (emptyState) emptyState.hidden = visibleProducts.length > 0;
  }

  if (sortSelect) sortSelect.addEventListener("change", updateProducts);
  const clearButton = document.querySelector("[data-clear-filters]");
  if (clearButton) clearButton.addEventListener("click", () => {
    activeCategory = "All";
    searchTerm = "";
    if (sortSelect) sortSelect.value = "featured";
    if (categoryFilters) categoryFilters.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.classList.toggle("is-selected", chip.textContent === "All");
    });
    const searchInput = document.querySelector("#site-search");
    if (searchInput) searchInput.value = "";
    updateProducts();
  });
  updateProducts();
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const addButton = target.closest("[data-add-to-cart]");
  if (addButton) addToCart(addButton.getAttribute("data-add-to-cart"));
});

document.addEventListener("DOMContentLoaded", () => {
  initializeHeader();
  updateCartCount();
  initializeProductPage();
  document.querySelectorAll("[data-featured-products]").forEach((container) => {
    renderProductCollection(container, products.filter((product) => product.featured).slice(0, 4));
  });
  document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      showToast("Thanks for joining The_Okoli notes.");
      form.reset();
    });
  });
  document.querySelectorAll("[data-year]").forEach((year) => {
    year.textContent = String(new Date().getFullYear());
  });
});
