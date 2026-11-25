const checkoutItemsEl = document.getElementById("checkout-items");
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const discountEl = document.getElementById("discount");
const grandTotalEl = document.getElementById("grand-total");
const backLinkEl = document.getElementById("back-link");

const promoInput = document.getElementById("promo-input");
const applyPromoBtn = document.getElementById("apply-promo-btn");
const promoMsgEl = document.getElementById("promo-msg");

const orderForm = document.getElementById("order-form");
const studentNameInput = document.getElementById("student-name");
const rollNumberInput = document.getElementById("roll-number");
const orderMsgEl = document.getElementById("order-msg");

function loadCheckoutCart() {
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

let cart = loadCheckoutCart();
let promoApplied = false;

function updateBackLink() {
  if (cart.length > 0) {
    backLinkEl.href = `../index.html?cart=${encodeURIComponent(JSON.stringify(cart))}`;
  } else {
    backLinkEl.href = "../index.html";
  }
}

function calculateSubtotal() {
  return cart.reduce((sum, item) => sum + Number(item.price) * (item.qty || 1), 0);
}

function renderCheckout() {
  checkoutItemsEl.innerHTML = "";

  if (cart.length === 0) {
    checkoutItemsEl.innerHTML = '<li class="empty-state">No items found in your order.</li>';
  } else {
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.className = "cart-row";
      li.innerHTML = `
        <span>${item.name} × ${item.qty || 1}</span>
        <span>₹${(Number(item.price) * (item.qty || 1)).toFixed(2)}</span>
      `;
      checkoutItemsEl.appendChild(li);
    });
  }

  const subtotal = calculateSubtotal();
  const discountAmount = promoApplied && subtotal >= 150 ? subtotal * 0.15 : 0;
  const tax = subtotal * 0.05;
  const grandTotal = Math.max(0, subtotal + tax - discountAmount);

  subtotalEl.textContent = subtotal.toFixed(2);
  taxEl.textContent = tax.toFixed(2);
  discountEl.textContent = discountAmount.toFixed(2);
  grandTotalEl.textContent = grandTotal.toFixed(2);
  updateBackLink();
}

applyPromoBtn.addEventListener("click", () => {
  const code = promoInput.value.trim().toUpperCase();
  const subtotal = calculateSubtotal();

  if (code !== "STUDENT15") {
    promoApplied = false;
    promoMsgEl.className = "msg-error";
    promoMsgEl.textContent = "Invalid promo code. Try STUDENT15.";
  } else if (subtotal < 150) {
    promoApplied = false;
    promoMsgEl.className = "msg-error";
    promoMsgEl.textContent = "STUDENT15 requires a minimum subtotal of ₹150.";
  } else {
    promoApplied = true;
    promoMsgEl.className = "msg-success";
    promoMsgEl.textContent = "Promo STUDENT15 applied (15% off)!";
  }

  renderCheckout();
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const studentName = studentNameInput.value.trim();
  const rollNumber = rollNumberInput.value.trim();

  if (cart.length === 0) {
    orderMsgEl.className = "msg-error";
    orderMsgEl.textContent = "Your cart is empty.";
    return;
  }

  if (!studentName || !rollNumber) {
    orderMsgEl.className = "msg-error";
    orderMsgEl.textContent = "Please enter both your full name and roll number.";
    return;
  }

  try {
    localStorage.removeItem("campus_cart");
  } catch (e) {
    // Ignore storage block
  }

  cart = [];
  promoApplied = false;
  orderForm.reset();
  promoInput.value = "";
  promoMsgEl.textContent = "";

  orderMsgEl.className = "msg-success";
  orderMsgEl.textContent = `Order confirmed for ${studentName} (${rollNumber})!`;
  renderCheckout();
});

renderCheckout();