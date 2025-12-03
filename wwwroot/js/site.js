// ShopHub E-commerce Site JavaScript

// Global cache for products data
let productsCache = {
  products: [],
  categories: [],
  timestamp: null,
  isLoaded: false
};

// Current filters state
let currentFilters = {
  searchQuery: null,
  categoryId: null,
  minPrice: null,
  maxPrice: null,
  minRating: null,
  page: 1,
  pageSize: 12
};

document.addEventListener("DOMContentLoaded", function () {
  initializeEventListeners();
  loadCartCount();
  loadWishlistCount();
  initializeCartOverlay();
  
  // Preload products data if on index page
  if (document.getElementById("productListContainer")) {
    preloadProductsData();
  }
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
      window.location.href = "/Checkout";
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

  // Khởi tạo lại event cho danh sách sản phẩm (phục vụ lần load đầu tiên)
  rebindProductListEvents();
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
    page: 1,
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

  if (filters.page && filters.page > 1) {
    params.append("page", filters.page);
  }

  // Build URLs
  const origin = window.location.origin;
  const baseIndexUrl = `${origin}/Home/Index`;
  const baseFilterUrl = `${origin}/Home/FilterProducts`;
  const queryString = params.toString();
  const finalIndexUrl = queryString ? `${baseIndexUrl}?${queryString}` : baseIndexUrl;
  const finalFilterUrl = queryString ? `${baseFilterUrl}?${queryString}` : baseFilterUrl;

  // Update URL without full reload
  if (window.history && window.history.pushState) {
    window.history.pushState(null, "", finalIndexUrl);
  }

  const container = document.getElementById("productListContainer");
  if (!container) {
    // Fallback: nếu không có container, reload trang như cũ
    window.location.href = finalIndexUrl;
    return;
  }

  // Use client-side filtering if cache is loaded
  if (productsCache.isLoaded) {
    // Update current filters
    currentFilters = { ...filters };
    currentFilters.searchQuery = searchQuery || null;
    currentFilters.pageSize = 12;
    
    // Filter and render from cache
    const filteredProducts = filterProductsClientSide(productsCache.products, currentFilters);
    renderProductsFromCache(filteredProducts, currentFilters.page || 1, currentFilters.pageSize);
    return;
  }

  // Fallback to server-side filtering
  // Hiển thị trạng thái loading nhẹ
  container.classList.add("opacity-50");

  fetch(finalFilterUrl, {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((html) => {
      container.innerHTML = html;
      container.classList.remove("opacity-50");

      // Re-bind event listeners cho các nút trong danh sách mới
      rebindProductListEvents();
    })
    .catch((error) => {
      container.classList.remove("opacity-50");
      console.error("Error loading products:", error);
      showNotification("Không thể tải sản phẩm. Vui lòng thử lại!", "error");
    });
}

function rebindProductListEvents() {
  // Add to cart buttons trong danh sách sản phẩm
  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const productId = this.dataset.productId;
      const productName = this.dataset.productName;
      const productPrice = this.dataset.productPrice;
      const img = this.closest(".bg-white").querySelector("img").src;

      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItem = cart.find((item) => item.id === productId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          id: productId,
          name: productName,
          image: img,
          price: productPrice,
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      showNotification(`${productName} added to cart!`, "success");
      updateCartCount();
    });
  });

  // Wishlist buttons
  document.querySelectorAll(".wishlist-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const icon = this.querySelector("i");
      icon.classList.toggle("fas");
      icon.classList.toggle("far");
      icon.classList.toggle("text-red-600");
    });
  });

  // Pagination links (AJAX)
  const productListContainer = document.getElementById("productListContainer");
  if (productListContainer) {
    productListContainer
      .querySelectorAll("[data-page-link]")
      .forEach((link) => {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          const page = parseInt(this.dataset.page);
          if (!isNaN(page)) {
            const filters = getActiveFilters();
            filters.page = page;
            applyFilters(filters);
          }
        });
      });
  }
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

  // Clear search input
  const searchInput = document.querySelector('input[name="q"]');
  if (searchInput) searchInput.value = "";

  // Reset filters
  currentFilters = {
    searchQuery: null,
    categoryId: null,
    minPrice: null,
    maxPrice: null,
    minRating: null,
    page: 1,
    pageSize: 12
  };

  // Update URL
  const origin = window.location.origin;
  if (window.history && window.history.pushState) {
    window.history.pushState(null, "", `${origin}/Home/Index`);
  }

  // Apply filters
  if (productsCache.isLoaded) {
    const filteredProducts = filterProductsClientSide(productsCache.products, currentFilters);
    renderProductsFromCache(filteredProducts, 1, 12);
  } else {
    const filters = getActiveFilters();
    filters.page = 1;
    applyFilters(filters);
  }
}

// Refresh cache manually
function refreshProductsCache() {
  productsCache.isLoaded = false;
  productsCache.timestamp = null;
  preloadProductsData();
}

// Preload products data from API
async function preloadProductsData() {
  const container = document.getElementById("productListContainer");
  if (!container) return;

  // Check if cache is still valid (5 minutes)
  const cacheAge = productsCache.timestamp 
    ? (Date.now() - new Date(productsCache.timestamp).getTime()) / 1000 / 60 
    : Infinity;
  
  if (productsCache.isLoaded && cacheAge < 5) {
    // Use cached data
    applyFiltersFromCache();
    return;
  }

  // Show loading indicator
  container.classList.add("opacity-50");
  
  try {
    const response = await fetch("/Home/GetAllProductsJson", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Store in cache
    productsCache.products = data.products || [];
    productsCache.categories = data.categories || [];
    productsCache.timestamp = data.timestamp;
    productsCache.isLoaded = true;

    // Apply current filters from URL
    applyFiltersFromCache();
    
    container.classList.remove("opacity-50");
  } catch (error) {
    container.classList.remove("opacity-50");
    console.error("Error preloading products:", error);
    // Fallback to server-side filtering
    useServerSideFiltering();
  }
}

// Apply filters using cached data (client-side)
function applyFiltersFromCache() {
  if (!productsCache.isLoaded) {
    useServerSideFiltering();
    return;
  }

  // Get current filters from URL or form
  const urlParams = new URLSearchParams(window.location.search);
  currentFilters.searchQuery = urlParams.get("searchQuery") || null;
  currentFilters.categoryId = urlParams.get("categoryId") ? parseInt(urlParams.get("categoryId")) : null;
  currentFilters.minPrice = urlParams.get("minPrice") ? parseFloat(urlParams.get("minPrice")) : null;
  currentFilters.maxPrice = urlParams.get("maxPrice") ? parseFloat(urlParams.get("maxPrice")) : null;
  currentFilters.minRating = urlParams.get("minRating") ? parseInt(urlParams.get("minRating")) : null;
  currentFilters.page = urlParams.get("page") ? parseInt(urlParams.get("page")) : 1;

  // Filter products client-side
  const filteredProducts = filterProductsClientSide(productsCache.products, currentFilters);

  // Render products
  renderProductsFromCache(filteredProducts, currentFilters.page, currentFilters.pageSize);
}

// Filter products client-side
function filterProductsClientSide(products, filters) {
  let filtered = [...products];

  // Search filter
  if (filters.searchQuery && filters.searchQuery.trim() !== "") {
    const query = filters.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.productName.toLowerCase().includes(query)
    );
  }

  // Category filter
  if (filters.categoryId) {
    filtered = filtered.filter(p => p.categoryId === filters.categoryId);
  }

  // Price filters
  if (filters.minPrice !== null) {
    filtered = filtered.filter(p => p.price >= filters.minPrice);
  }
  if (filters.maxPrice !== null) {
    filtered = filtered.filter(p => p.price <= filters.maxPrice);
  }

  // Rating filter
  if (filters.minRating !== null && filters.minRating > 0) {
    filtered = filtered.filter(p => p.averageRating >= filters.minRating);
  }

  return filtered;
}

// Render products from cache
function renderProductsFromCache(filteredProducts, page, pageSize) {
  const container = document.getElementById("productListContainer");
  if (!container) return;

  // Calculate pagination
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Render products HTML
  let productsHtml = '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="products">';
  
  if (paginatedProducts.length > 0) {
    paginatedProducts.forEach(product => {
      const imageUrl = product.imageUrl || `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.productName)}`;
      const isInStock = product.stockQuantity > 0;
      const avgRating = product.averageRating || 0;
      const reviewCount = product.reviewCount || 0;
      
      // Render stars
      const starsHtml = renderStarsHtml(avgRating);
      
      productsHtml += `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition transform hover:scale-105 group">
          <a href="/Home/Details/${product.productId}"
             class="block relative bg-gray-200 h-48 overflow-hidden">
            <img src="${imageUrl}" alt="${product.productName}"
                 class="w-full h-full object-cover group-hover:opacity-75 transition" />
            ${!isInStock ? '<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"><span class="text-white font-bold text-lg">Hết hàng</span></div>' : ''}
          </a>
          <button
              class="absolute top-3 left-3 bg-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition wishlist-btn z-10"
              data-product-id="${product.productId}">
              <i class="far fa-heart text-gray-600"></i>
          </button>
          <div class="p-4">
            <a href="/Home/Details/${product.productId}" class="block">
              <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition">
                ${escapeHtml(product.productName)}
              </h3>
            </a>
            <div class="flex items-center mb-3">
              ${reviewCount > 0 
                ? `<div class="text-yellow-500 text-sm">${starsHtml}</div>
                   <span class="text-gray-600 text-sm ml-2">${avgRating.toFixed(1)} (${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})</span>`
                : `<div class="text-gray-300 text-sm">
                     <i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>
                   </div>
                   <span class="text-gray-400 text-sm ml-2">Chưa có đánh giá</span>`
              }
            </div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <span class="text-2xl font-bold text-blue-600">${formatPrice(product.price)}đ</span>
              </div>
            </div>
            <button
                class="w-full ${isInStock ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} text-white py-2 rounded-lg transition font-semibold add-to-cart-btn"
                data-product-id="${product.productId}"
                data-product-name="${escapeHtml(product.productName)}"
                data-product-price="${product.price}"
                ${!isInStock ? 'disabled' : ''}>
                <i class="fas fa-shopping-cart mr-2"></i>${isInStock ? 'Thêm vào giỏ' : 'Hết sản phẩm'}
            </button>
          </div>
        </div>
      `;
    });
  } else {
    productsHtml += `
      <div class="col-span-full text-center py-12">
        <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-2xl font-semibold text-gray-600 mb-2">No Products Found</h3>
        <p class="text-gray-500">Please check back later or try a different search.</p>
      </div>
    `;
  }
  
  productsHtml += '</div>';

  // Render pagination
  if (totalPages > 1) {
    productsHtml += renderPaginationHtml(page, totalPages);
  }

  container.innerHTML = productsHtml;

  // Re-bind event listeners
  rebindProductListEvents();
}

// Helper function to render stars HTML
function renderStarsHtml(rating) {
  if (rating <= 0) return '<i class="far fa-star"></i>'.repeat(5);
  
  const fullStars = Math.floor(rating);
  const hasHalfStar = (rating - fullStars) >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let html = '';
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fas fa-star"></i>';
  }
  if (hasHalfStar) {
    html += '<i class="fas fa-star-half-alt"></i>';
  }
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="far fa-star"></i>';
  }
  return html;
}

// Helper function to render pagination HTML
function renderPaginationHtml(currentPage, totalPages) {
  let html = '<div class="flex justify-center items-center gap-2 mt-12" data-pagination-container>';
  
  // Previous button
  if (currentPage > 1) {
    html += `<a href="#" data-page-link data-page="${currentPage - 1}"
                 class="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition">
                 <i class="fas fa-chevron-left"></i>
               </a>`;
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      html += `<button class="px-4 py-2 bg-blue-600 text-white rounded-lg" disabled>${i}</button>`;
    } else if (i >= currentPage - 2 && i <= currentPage + 2) {
      html += `<a href="#" data-page-link data-page="${i}"
                   class="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition">${i}</a>`;
    }
  }

  // Next button
  if (currentPage < totalPages) {
    html += `<a href="#" data-page-link data-page="${currentPage + 1}"
                 class="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition">
                 <i class="fas fa-chevron-right"></i>
               </a>`;
  }

  html += '</div>';
  return html;
}

// Helper functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Fallback to server-side filtering
function useServerSideFiltering() {
  // Use existing server-side filtering logic
  const filters = getActiveFilters();
  applyFilters(filters);
}

function handleSearch(event) {
  event.preventDefault();
  const query = event.target.querySelector('input[name="q"]').value.trim();
  
  if (query === "") {
    showNotification("Please enter a search term!", "warning");
    return;
  }

  // Update current filters
  currentFilters.searchQuery = query;
  currentFilters.page = 1;

  // Build URL
  const params = new URLSearchParams();
  params.append("searchQuery", query);
  
  // Preserve other filters
  const filters = getActiveFilters();
  if (filters.categoryId) params.append("categoryId", filters.categoryId);
  if (filters.minPrice !== null) params.append("minPrice", filters.minPrice);
  if (filters.maxPrice !== null) params.append("maxPrice", filters.maxPrice);
  if (filters.minRating !== null) params.append("minRating", filters.minRating);

  const origin = window.location.origin;
  const finalUrl = `${origin}/Home/Index?${params.toString()}`;

  // Update URL
  if (window.history && window.history.pushState) {
    window.history.pushState(null, "", finalUrl);
  }

  // Apply filters using cache if available
  if (productsCache.isLoaded) {
    applyFiltersFromCache();
  } else {
    useServerSideFiltering();
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
