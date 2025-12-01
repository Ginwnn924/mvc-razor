// ShopHub E-commerce Site JavaScript

document.addEventListener("DOMContentLoaded", function () {
  initializeEventListeners();
  loadCartCount();
  loadWishlistCount();
  initializeCartOverlay();
});

// Initialize Cart Overlay
function initializeCartOverlay() {
  const cartToggle = document.getElementById("cartToggle");
  const closeCart = document.getElementById("closeCart");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartSidebar = document.getElementById("cartSidebar");
  const continueShopping = document.getElementById("continueShopping");
  const checkoutBtn = document.getElementById("checkoutBtn");

  if (!cartToggle) return;

  cartToggle.addEventListener("click", function (e) {
    e.preventDefault();
    openCart();
  });

  closeCart.addEventListener("click", function () {
    closeCartOverlay();
  });

  cartOverlay.addEventListener("click", function () {
    closeCartOverlay();
  });

  continueShopping.addEventListener("click", function () {
    closeCartOverlay();
  });

  // Checkout button - kiểm tra cart trước khi chuyển trang
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];

      if (cart.length === 0) {
        showNotification("Giỏ hàng trống! Vui lòng thêm sản phẩm.", "warning");
        return;
      }

      // Có sản phẩm - chuyển đến trang checkout
      window.location.href = "/Home/Checkout";
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeCartOverlay();
    }
  });

  const applyPromoBtn = document.getElementById("applyPromo");
  if (applyPromoBtn) {
    applyPromoBtn.addEventListener("click", applyPromoCode);
  }
}

function applyPromoCode() {
  const promoInput = document.getElementById("promoCode");
  const code = promoInput.value.trim().toUpperCase();

  if (!code) {
    showNotification("Please enter a promo code", "warning");
    return;
  }

  const promoCodes = {
    SAVE10: 0.1,
    SAVE20: 0.2,
    SAVE50: 0.5,
    WELCOME: 0.15,
  };

  if (promoCodes[code]) {
    const discount = promoCodes[code];
    localStorage.setItem("promoDiscount", discount);
    promoInput.value = "";
    renderCartItems();
    showNotification(
      `Promo code applied! ${(discount * 100).toFixed(0)}% off`,
      "success"
    );
  } else {
    showNotification("Invalid promo code", "error");
  }
}

function openCart() {
  const cartOverlay = document.getElementById("cartOverlay");
  const cartSidebar = document.getElementById("cartSidebar");

  cartOverlay.classList.remove("hidden");
  cartSidebar.classList.remove("translate-x-full");
  document.body.style.overflow = "hidden";
  renderCartItems();
}

function closeCartOverlay() {
  const cartOverlay = document.getElementById("cartOverlay");
  const cartSidebar = document.getElementById("cartSidebar");

  cartOverlay.classList.add("hidden");
  cartSidebar.classList.add("translate-x-full");
  document.body.style.overflow = "auto";
}

function renderCartItems() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItemsContainer = document.getElementById("cartItemsContainer");

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
            <div id="emptyCartMessage" class="text-center py-12">
                <i class="fas fa-shopping-bag text-5xl text-gray-300 mb-3"></i>
                <p class="text-gray-600 font-semibold">Giỏ hàng trống</p>
                <p class="text-gray-500 text-xs mt-1">Thêm sản phẩm để bắt đầu!</p>
            </div>
        `;
    updateCartTotals(0, []);
    return;
  }

  let html = "";
  let subtotal = 0;

  cart.forEach((item) => {
    const itemPrice = parseFloat(item.price) || 0;
    const itemTotal = itemPrice * item.quantity;
    subtotal += itemTotal;

    const imageUrl =
      item.image ||
      `https://via.placeholder.com/80x80?text=${encodeURIComponent(item.name)}`;

    html += `
            <div class="flex gap-3 pb-4 mb-4 border-b border-gray-200">
                <!-- Product Image -->
                <div class="flex-shrink-0">
                    <img src="${imageUrl}" alt="${
      item.name
    }" class="w-20 h-20 object-cover rounded bg-gray-100" />
                </div>
                
                <!-- Product Info -->
                <div class="flex-1 min-w-0 flex flex-col justify-between">
                    <h4 class="font-semibold text-gray-800 text-sm line-clamp-2">${
                      item.name
                    }</h4>
                    
                    <!-- Quantity Controls - Unified Block -->
                    <div class="inline-flex items-center border border-gray-300 rounded-lg bg-gray-50 w-fit">
                        <button class="px-3 py-2 text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition decrease-qty" data-product-id="${
                          item.id
                        }" title="Giảm số lượng">
                            <i class="fas fa-minus text-xs"></i>
                        </button>
                        <input type="number" value="${
                          item.quantity
                        }" class="w-12 text-center border-l border-r border-gray-300 py-2 focus:outline-none qty-input text-sm font-semibold bg-white" data-product-id="${
      item.id
    }" />
                        <button class="px-3 py-2 text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition increase-qty" data-product-id="${
                          item.id
                        }" title="Tăng số lượng">
                            <i class="fas fa-plus text-xs"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Price & Remove -->
                <div class="flex flex-col items-end justify-between">
                    <button class="text-gray-400 hover:text-red-500 transition remove-from-cart" data-product-id="${
                      item.id
                    }" title="Xóa sản phẩm">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                    <span class="font-bold text-gray-800 text-sm">${itemTotal.toLocaleString(
                      "vi-VN"
                    )}đ</span>
                </div>
            </div>
        `;
  });

  cartItemsContainer.innerHTML = html;
  updateCartTotals(subtotal, cart);

  document.querySelectorAll(".remove-from-cart").forEach((btn) => {
    btn.addEventListener("click", function () {
      removeFromCart(this.dataset.productId);
    });
  });

  document.querySelectorAll(".decrease-qty").forEach((btn) => {
    btn.addEventListener("click", function () {
      updateQuantity(this.dataset.productId, -1);
    });
  });

  document.querySelectorAll(".increase-qty").forEach((btn) => {
    btn.addEventListener("click", function () {
      updateQuantity(this.dataset.productId, 1);
    });
  });

  document.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("change", function () {
      const newQty = parseInt(this.value) || 1;
      setQuantity(this.dataset.productId, newQty);
    });
  });
}

function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCartItems();
  updateCartCount();
  showNotification("Item removed from cart", "info");
}

function updateQuantity(productId, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cart.find((item) => item.id === productId);

  if (item) {
    item.quantity += change;
    if (item.quantity < 1) {
      removeFromCart(productId);
      return; // Thoát hàm sau khi xóa
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
  }
}

function setQuantity(productId, quantity) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cart.find((item) => item.id === productId);

  if (item) {
    item.quantity = Math.max(1, quantity);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
  }
}

function updateCartTotals(subtotal, cart) {
  const promoDiscount = parseFloat(localStorage.getItem("promoDiscount")) || 0;
  const discountAmount = subtotal * promoDiscount;
  const subtotalAfterDiscount = subtotal - discountAmount;

  const totalElement = document.getElementById("total");
  if (totalElement) {
    totalElement.textContent =
      Math.round(subtotalAfterDiscount).toLocaleString("vi-VN") + "đ";
  }
}

function initializeEventListeners() {
  const addToCartButtons = document.querySelectorAll("[data-add-to-cart]");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", handleAddToCart);
  });

  const wishlistButtons = document.querySelectorAll("[data-wishlist]");
  wishlistButtons.forEach((button) => {
    button.addEventListener("click", handleWishlist);
  });

  const filterButtons = document.querySelectorAll("[data-filter]");
  filterButtons.forEach((button) => {
    button.addEventListener("change", handleFilter);
  });

  // Ensure only one rating checkbox is selected at a time
  const ratingCheckboxes = document.querySelectorAll('input[data-filter="rating"]');
  ratingCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        ratingCheckboxes.forEach((cb) => {
          if (cb !== this) {
            cb.checked = false;
          }
        });
      }
    });
  });

  // Toggle custom price inputs
  const priceRadios = document.querySelectorAll('input[name="price"]');
  priceRadios.forEach((radio) => {
    radio.addEventListener("change", toggleCustomPriceInputs);
  });

  // Apply custom price button
  const applyCustomPriceBtn = document.getElementById("applyCustomPrice");
  if (applyCustomPriceBtn) {
    applyCustomPriceBtn.addEventListener("click", handleApplyCustomPrice);
  }

  const clearFiltersBtn = document.querySelector("[data-clear-filters]");
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", handleClearFilters);
  }

  const searchForm = document.querySelector(
    'form[method="get"][action*="Search"]'
  );
  if (searchForm) {
    searchForm.addEventListener("submit", handleSearch);
  }

  // Initialize custom price inputs visibility
  toggleCustomPriceInputs();
}

function handleAddToCart(event) {
  event.preventDefault();
  const productId = event.target.dataset.productId || 1;
  const productName = event.target.dataset.productName || "Product";
  const productPrice = parseFloat(event.target.dataset.productPrice) || 0;

  addToCart(productId, productName, productPrice);
  showNotification(`${productName} added to cart!`, "success");
  updateCartCount();
}

function addToCart(productId, productName, productPrice = 0) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: productName,
      price: productPrice,
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
}

function handleWishlist(event) {
  event.preventDefault();
  const button = event.target.closest("button");
  const productName = button.closest(".bg-white")
    ? button.closest(".bg-white").querySelector("h3").textContent
    : "Product";

  button.classList.toggle("text-red-600");
  button.classList.toggle("fas");
  button.classList.toggle("far");

  const isWishlisted = button.classList.contains("fas");

  if (isWishlisted) {
    showNotification(`${productName} added to wishlist!`, "success");
  } else {
    showNotification(`${productName} removed from wishlist!`, "info");
  }

  updateWishlistCount();
}

function toggleCustomPriceInputs() {
  const customInputs = document.getElementById("customPriceInputs");
  const customRadio = document.getElementById("priceCustomRadio");
  
  if (customInputs && customRadio) {
    if (customRadio.checked) {
      customInputs.classList.remove("hidden");
    } else {
      customInputs.classList.add("hidden");
    }
  }
}

function handleApplyCustomPrice() {
  const filters = getActiveFilters();
  applyFilters(filters);
}

function handleFilter(event) {
  // If custom radio is selected, don't auto-apply (wait for Apply button)
  const customRadio = document.getElementById("priceCustomRadio");
  if (customRadio && customRadio.checked) {
    toggleCustomPriceInputs();
    return;
  }
  
  const filters = getActiveFilters();
  applyFilters(filters);
}

function getActiveFilters() {
  const filters = {
    categoryId: null,
    minPrice: null,
    maxPrice: null,
    minRating: null,
  };

  // Get selected category (if using radio buttons)
  const categoryRadio = document.querySelector('input[name="category"]:checked');
  if (categoryRadio && categoryRadio.value && categoryRadio.value !== "") {
    filters.categoryId = parseInt(categoryRadio.value);
  }

  // Get selected price range
  const priceRadio = document.querySelector('input[name="price"]:checked');
  if (priceRadio) {
    const priceValue = priceRadio.value;
    
    if (priceValue === "custom") {
      // Get custom price inputs
      const customMinPrice = document.getElementById("customMinPrice");
      const customMaxPrice = document.getElementById("customMaxPrice");
      
      if (customMinPrice && customMinPrice.value) {
        filters.minPrice = parseFloat(customMinPrice.value);
      }
      if (customMaxPrice && customMaxPrice.value) {
        filters.maxPrice = parseFloat(customMaxPrice.value);
      }
    } else if (priceValue) {
      // Parse predefined ranges
      if (priceValue === "0-50000") {
        filters.minPrice = 0;
        filters.maxPrice = 50000;
      } else if (priceValue === "50000-200000") {
        filters.minPrice = 50000;
        filters.maxPrice = 200000;
      } else if (priceValue === "200000-1000000") {
        filters.minPrice = 200000;
        filters.maxPrice = 1000000;
      } else if (priceValue === "1000000-") {
        filters.minPrice = 1000000;
        filters.maxPrice = null;
      }
    }
  }

  // Get selected rating (only one allowed)
  const ratingCheckboxes = document.querySelectorAll('input[data-filter="rating"]');
  ratingCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      const ratingValue = parseInt(checkbox.value);
      if (!isNaN(ratingValue)) {
        filters.minRating = ratingValue;
      }
    }
  });

  return filters;
}

function applyFilters(filters) {
  // Validate custom price inputs
  if (filters.minPrice !== null && filters.maxPrice !== null && filters.minPrice > filters.maxPrice) {
    showNotification("Giá tối thiểu phải nhỏ hơn giá tối đa!", "error");
    return;
  }

  if (filters.minPrice !== null && filters.minPrice < 0) {
    showNotification("Giá tối thiểu phải lớn hơn hoặc bằng 0!", "error");
    return;
  }

  if (filters.maxPrice !== null && filters.maxPrice < 0) {
    showNotification("Giá tối đa phải lớn hơn hoặc bằng 0!", "error");
    return;
  }

  // Build query parameters
  const params = new URLSearchParams();
  
  // Preserve search query if exists
  const currentUrl = new URL(window.location.href);
  const searchQuery = currentUrl.searchParams.get("searchQuery");
  if (searchQuery) {
    params.append("searchQuery", searchQuery);
  }

  // Add filter parameters
  if (filters.categoryId) {
    params.append("categoryId", filters.categoryId);
  }
  if (filters.minPrice !== null) {
    params.append("minPrice", filters.minPrice);
  }
  if (filters.maxPrice !== null) {
    params.append("maxPrice", filters.maxPrice);
  }

  if (filters.minRating !== null) {
    params.append("minRating", filters.minRating);
  }

  // Redirect to Index with filters
  const origin = window.location.origin;
  const indexUrl = `${origin}/Home/Index`;
  const queryString = params.toString();
  const finalUrl = queryString ? `${indexUrl}?${queryString}` : indexUrl;
  
  window.location.href = finalUrl;
}

function handleClearFilters(event) {
  event.preventDefault();

  // Uncheck all radio buttons
  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.checked = false;
  });

  // Uncheck all rating checkboxes
  document.querySelectorAll('input[data-filter="rating"]').forEach((checkbox) => {
    checkbox.checked = false;
  });

  // Check "All" options
  const allCategoryRadio = document.querySelector('input[name="category"][value=""]');
  if (allCategoryRadio) {
    allCategoryRadio.checked = true;
  }
  const allPriceRadio = document.querySelector('input[name="price"][value=""]');
  if (allPriceRadio) {
    allPriceRadio.checked = true;
  }

  // Clear custom price inputs
  const customMinPrice = document.getElementById("customMinPrice");
  const customMaxPrice = document.getElementById("customMaxPrice");
  if (customMinPrice) customMinPrice.value = "";
  if (customMaxPrice) customMaxPrice.value = "";

  // Hide custom inputs
  const customInputs = document.getElementById("customPriceInputs");
  if (customInputs) {
    customInputs.classList.add("hidden");
  }

  // Redirect to Index without filters
  const currentUrl = new URL(window.location.href);
  const searchQuery = currentUrl.searchParams.get("searchQuery");
  
  const origin = window.location.origin;
  const indexUrl = `${origin}/Home/Index`;
  const finalUrl = searchQuery ? `${indexUrl}?searchQuery=${encodeURIComponent(searchQuery)}` : indexUrl;
  
  window.location.href = finalUrl;
}

function handleSearch(event) {
  const query = event.target.querySelector('input[name="q"]').value;
  if (query.trim() === "") {
    event.preventDefault();
    showNotification("Please enter a search term!", "warning");
  }
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cart.length; // Đếm số sản phẩm khác nhau

  const cartBadges = document.querySelectorAll("[data-cart-count]");
  cartBadges.forEach((badge) => {
    badge.textContent = cartCount;
  });
}

function updateWishlistCount() {
  const wishlistItems = document.querySelectorAll("[data-wishlist].fas");
  const wishlistCount = wishlistItems.length;

  const wishlistBadges = document.querySelectorAll("[data-wishlist-count]");
  wishlistBadges.forEach((badge) => {
    badge.textContent = wishlistCount;
  });
}

function loadCartCount() {
  updateCartCount();
}

function loadWishlistCount() {
  updateWishlistCount();
}

function showNotification(message, type = "info") {
  // Tạo container cho notifications nếu chưa có
  let container = document.getElementById("notification-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    container.className = "fixed top-4 right-4 z-50 flex flex-col gap-2";
    document.body.appendChild(container);
  }

  const notification = document.createElement("div");
  notification.className = `px-6 py-3 rounded-lg text-white font-semibold shadow-lg transform transition-all duration-300`;
  // Bắt đầu với opacity 0 và translate để có animation slide in
  notification.style.opacity = "0";
  notification.style.transform = "translateX(100%)";

  switch (type) {
    case "success":
      notification.classList.add("bg-green-500");
      break;
    case "error":
      notification.classList.add("bg-red-500");
      break;
    case "warning":
      notification.classList.add("bg-yellow-500");
      break;
    default:
      notification.classList.add("bg-blue-500");
  }

  notification.textContent = message;

  // Thêm notification mới vào CUỐI container (message mới ở dưới, theo kiểu list)
  // A xuất hiện trước -> ở trên
  // B xuất hiện sau -> ở dưới A
  container.appendChild(notification);

  // Trigger animation slide in
  requestAnimationFrame(() => {
    notification.style.opacity = "1";
    notification.style.transform = "translateX(0)";
  });

  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      notification.remove();
      // Xóa container nếu không còn notification nào
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, 3000);
}

function smoothScroll(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

window.ShopHub = {
  addToCart,
  showNotification,
  smoothScroll,
  formatCurrency,
  updateCartCount,
  updateWishlistCount,
};
