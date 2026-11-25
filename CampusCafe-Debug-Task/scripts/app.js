const menuGrid = document.getElementById("menu-grid");
const cartList = document.getElementById("cart-list");
const cartSubtotalEl = document.getElementById("cart-subtotal");
const cartCountEl = document.getElementById("cart-count");
const cartMsgEl = document.getElementById("cart-msg");
const checkoutBtn = document.getElementById("checkout-btn");
const filterBtns = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("search-input");

function loadCart() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("cart")) {
    try {
      const parsed = JSON.parse(params.get("cart"));
      localStorage.setItem("campus_cart", JSON.stringify(parsed));
      return parsed;
    } catch (e) {
      // Fallback to localStorage
    }
  }
  try {
    return JSON.parse(localStorage.getItem("campus_cart")) || [];
  } catch (e) {
    return [];
  }
}

let cart = loadCart();
let activeCategory = "all";

function renderMenu(items) {
  menuGrid.innerHTML = "";

  if (items.length === 0) {
    menuGrid.innerHTML = '<p class="empty-state">No menu items match your search.</p>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="card-header">
        <span class="category-tag">${item.category}</span>
        <span class="price">₹${item.price}</span>
      </div>
      <h3>${item.name}</h3>
      <p style="font-size: 0.85rem; color: #6b7280;">${item.description}</p>
      <button type="button" class="btn btn-primary add-btn" data-id="${item.id}">Add to Cart</button>
    `;
    menuGrid.appendChild(card);
  });

  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(Number(btn.dataset.id));
    });
  });
}

function addToCart(itemId) {
  const found = MENU_ITEMS.find((item) => item.id === itemId);
  if (!found) return;

  const existing = cart.find((item) => item.id === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: found.id,
      name: found.name,
      price: Number(found.price),
      qty: 1
    });
  }

  cartMsgEl.textContent = "";
  saveCart();
  renderCart();
}

function updateQty(itemId, delta) {
  const index = cart.findIndex((item) => item.id === itemId);
  if (index === -1) return;

  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }

  saveCart();
  renderCart();
}

function saveCart() {
  try {
    localStorage.setItem("campus_cart", JSON.stringify(cart));
  } catch (e) {
    // Ignore storage block on file://
  }
}

function renderCart() {
  cartList.innerHTML = "";

  if (cart.length === 0) {
    cartList.innerHTML = '<li class="empty-state">Your cart is empty.</li>';
  } else {
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.className = "cart-row";
      li.innerHTML = `
        <span>${item.name}</span>
        <div class="qty-controls">
          <button type="button" class="qty-btn" data-action="dec" data-id="${item.id}">-</button>
          <span>${item.qty}</span>
          <button type="button" class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
          <span style="min-width: 48px; text-align: right;">₹${item.price * item.qty}</span>
        </div>
      `;
      cartList.appendChild(li);
    });

    document.querySelectorAll(".qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const delta = btn.dataset.action === "inc" ? 1 : -1;
        updateQty(id, delta);
      });
    });
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

  cartSubtotalEl.textContent = subtotal;
  cartCountEl.textContent = totalCount;
}

function filterMenu() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = MENU_ITEMS.filter((item) => {
    const categoryOk = activeCategory === "all" || item.category === activeCategory;
    const searchOk =
      item.name.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term);
    return categoryOk && searchOk;
  });
  renderMenu(filtered);
}

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.category;
    filterMenu();
  });
});

searchInput.addEventListener("input", filterMenu);

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    cartMsgEl.textContent = "Please add at least one item before checking out.";
    return;
  }
  saveCart();
  const encodedCart = encodeURIComponent(JSON.stringify(cart));
  window.location.href = `pages/checkout.html?cart=${encodedCart}`;
});

// Initialize
renderMenu(MENU_ITEMS);
renderCart();