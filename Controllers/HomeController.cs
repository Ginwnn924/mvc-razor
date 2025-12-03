using Microsoft.AspNetCore.Mvc;
using mvc_razor.Models;
using mvc_razor.Data;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace mvc_razor.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _context;

        public HomeController(ILogger<HomeController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<IActionResult> Index(
            int page = 1,
            int pageSize = 12,
            string? searchQuery = null,
            int? categoryId = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            int? minRating = null)
        {
            try
            {
                // Start with base query
                var query = _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Inventory)
                    .AsQueryable();

                // Apply search filter
                if (!string.IsNullOrWhiteSpace(searchQuery))
                {
                    query = query.Where(p => p.ProductName.Contains(searchQuery));
                }

                // Apply category filter
                if (categoryId.HasValue && categoryId.Value > 0)
                {
                    query = query.Where(p => p.CategoryId == categoryId.Value);
                }

                // Apply price filters
                if (minPrice.HasValue)
                {
                    query = query.Where(p => p.Price >= (long)minPrice.Value);
                }
                if (maxPrice.HasValue)
                {
                    query = query.Where(p => p.Price <= (long)maxPrice.Value);
                }

                // Apply rating filter (minimum average rating)
                if (minRating.HasValue && minRating.Value > 0)
                {
                    query = query.Where(p =>
                        _context.Reviews
                            .Where(r => r.ProductId == p.ProductId && !r.IsDeleted)
                            .Any())
                        .Where(p =>
                            _context.Reviews
                                .Where(r => r.ProductId == p.ProductId && !r.IsDeleted)
                                .Average(r => r.Rating) >= minRating.Value);
                }

                // Get total count after filters
                var totalProducts = await query.CountAsync();

                // Get products with pagination
                var products = await query
                    .Where(p => p.IsDeleted == false)
                    .Include(p => p.Reviews)
                    .OrderByDescending(p => p.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Calculate rating info for each product
                var productRatings = new Dictionary<int, ProductRatingInfo>();
                foreach (var product in products)
                {
                    var activeReviews = product.Reviews?.Where(r => !r.IsDeleted).ToList() ?? new List<ReviewModel>();
                    var reviewCount = activeReviews.Count;
                    var averageRating = reviewCount > 0 
                        ? (decimal)activeReviews.Average(r => r.Rating) 
                        : 0;

                    productRatings[product.ProductId] = new ProductRatingInfo
                    {
                        ProductId = product.ProductId,
                        AverageRating = averageRating,
                        ReviewCount = reviewCount
                    };
                }

                var bestSellerProducts = await _context.Products
                    .FromSqlRaw(@"
                        SELECT p.* FROM products p 
                        JOIN order_items oi ON p.product_id = oi.product_id 
                        GROUP BY p.product_id 
                        ORDER BY COUNT(*) DESC 
                        LIMIT 4")
                    .Include(p => p.Category)
                    .Include(p => p.Inventory)
                    .Include(p => p.Reviews)
                    .ToListAsync();

                // Calculate rating info for best sellers
                var bestSellerRatings = new Dictionary<int, ProductRatingInfo>();
                foreach (var product in bestSellerProducts)
                {
                    var activeReviews = product.Reviews?.Where(r => !r.IsDeleted).ToList() ?? new List<ReviewModel>();
                    var reviewCount = activeReviews.Count;
                    var averageRating = reviewCount > 0 
                        ? (decimal)activeReviews.Average(r => r.Rating) 
                        : 0;

                    bestSellerRatings[product.ProductId] = new ProductRatingInfo
                    {
                        ProductId = product.ProductId,
                        AverageRating = averageRating,
                        ReviewCount = reviewCount
                    };
                }

                // Get all categories for filter sidebar
                var categories = await _context.Categories
                    .OrderBy(c => c.CategoryName)
                    .ToListAsync();

                // Pass data to ViewBag for sidebar and search box
                ViewBag.Categories = categories;
                ViewBag.SelectedCategoryId = categoryId;
                ViewBag.MinPrice = minPrice;
                ViewBag.MaxPrice = maxPrice;
                ViewBag.SearchQuery = searchQuery;
                ViewBag.MinRating = minRating;
                ViewBag.ProductRatings = productRatings;
                ViewBag.BestSellerRatings = bestSellerRatings;

                // Create view model
                var viewModel = new ProductListViewModel
                {
                    Products = products,
                    CurrentPage = page,
                    BestSaler = bestSellerProducts,
                    PageSize = pageSize,
                    TotalProducts = totalProducts,
                    TotalPages = (int)Math.Ceiling((double)totalProducts / pageSize),
                    SearchQuery = searchQuery,
                    SelectedCategoryId = categoryId,
                    MinPrice = minPrice,
                    MaxPrice = maxPrice
                };

                return View(viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading products");
                return View(new ProductListViewModel { Products = new List<ProductModel>() });
            }
        }

        [HttpGet]
        public async Task<IActionResult> FilterProducts(
            int page = 1,
            int pageSize = 12,
            string? searchQuery = null,
            int? categoryId = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            int? minRating = null)
        {
            // Tái sử dụng toàn bộ logic trong Index để đảm bảo kết quả đồng nhất
            var result = await Index(page, pageSize, searchQuery, categoryId, minPrice, maxPrice, minRating) as ViewResult;

            if (result?.Model is ProductListViewModel viewModel)
            {
                // Calculate rating info for products in viewModel (đảm bảo ViewBag có rating info)
                var productRatings = new Dictionary<int, ProductRatingInfo>();
                foreach (var product in viewModel.Products)
                {
                    var activeReviews = product.Reviews?.Where(r => !r.IsDeleted).ToList() ?? new List<ReviewModel>();
                    var reviewCount = activeReviews.Count;
                    var averageRating = reviewCount > 0 
                        ? (decimal)activeReviews.Average(r => r.Rating) 
                        : 0;

                    productRatings[product.ProductId] = new ProductRatingInfo
                    {
                        ProductId = product.ProductId,
                        AverageRating = averageRating,
                        ReviewCount = reviewCount
                    };
                }
                
                // Set ViewBag để PartialView có thể sử dụng
                ViewBag.ProductRatings = productRatings;
                
                return PartialView("_ProductList", viewModel);
            }

            return BadRequest("Unable to load products");
        }

        public async Task<IActionResult> Details(int id)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Inventory)
                    .Include(p => p.Reviews)
                    .FirstOrDefaultAsync(p => p.ProductId == id);

                if (product == null)
                {
                    return NotFound();
                }

                // Get active reviews (not deleted) and include customer info
                var activeReviews = product.Reviews?
                    .Where(r => !r.IsDeleted)
                    .OrderByDescending(r => r.CreatedAt)
                    .ToList() ?? new List<ReviewModel>();

                // Load customer names for reviews
                var customerIds = activeReviews
                    .Where(r => r.CustomerId.HasValue)
                    .Select(r => r.CustomerId!.Value)
                    .Distinct()
                    .ToList();

                var customers = await _context.Customers
                    .Where(c => customerIds.Contains(c.CustomerId))
                    .ToDictionaryAsync(c => c.CustomerId, c => c.Name);

                // Calculate rating info for main product
                var reviewCount = activeReviews.Count;
                var averageRating = reviewCount > 0 
                    ? (decimal)activeReviews.Average(r => r.Rating) 
                    : 0;

                // Calculate rating distribution
                var ratingDistribution = new Dictionary<int, int>
                {
                    { 5, 0 }, { 4, 0 }, { 3, 0 }, { 2, 0 }, { 1, 0 }
                };
                foreach (var review in activeReviews)
                {
                    if (ratingDistribution.ContainsKey(review.Rating))
                    {
                        ratingDistribution[review.Rating]++;
                    }
                }

                var productRating = new ProductRatingInfo
                {
                    ProductId = product.ProductId,
                    AverageRating = averageRating,
                    ReviewCount = reviewCount
                };

                // Get related products (same category)
                var relatedProducts = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Inventory)
                    .Include(p => p.Reviews)
                    .Where(p => p.CategoryId == product.CategoryId && p.ProductId != id && !p.IsDeleted)
                    .Take(4)
                    .ToListAsync();

                // Calculate rating info for related products
                var relatedProductRatings = new Dictionary<int, ProductRatingInfo>();
                foreach (var relatedProduct in relatedProducts)
                {
                    var relatedActiveReviews = relatedProduct.Reviews?.Where(r => !r.IsDeleted).ToList() ?? new List<ReviewModel>();
                    var relatedReviewCount = relatedActiveReviews.Count;
                    var relatedAverageRating = relatedReviewCount > 0 
                        ? (decimal)relatedActiveReviews.Average(r => r.Rating) 
                        : 0;

                    relatedProductRatings[relatedProduct.ProductId] = new ProductRatingInfo
                    {
                        ProductId = relatedProduct.ProductId,
                        AverageRating = relatedAverageRating,
                        ReviewCount = relatedReviewCount
                    };
                }

                // Pass data to ViewBag
                ViewBag.ProductRating = productRating;
                ViewBag.ProductReviews = activeReviews;
                ViewBag.Customers = customers;
                ViewBag.RatingDistribution = ratingDistribution;
                ViewBag.RelatedProductRatings = relatedProductRatings;

                var viewModel = new ProductDetailsViewModel
                {
                    Product = product,
                    RelatedProducts = relatedProducts
                };

                return View(viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading product details");
                return NotFound();
            }
        }

        public IActionResult Search(string q, int page = 1, int pageSize = 12, int? categoryId = null, decimal? minPrice = null, decimal? maxPrice = null)
        {
            if (string.IsNullOrWhiteSpace(q))
            {
                return RedirectToAction("Index");
            }

            // Redirect to Index with search query parameter
            return RedirectToAction("Index", new
            {
                searchQuery = q,
                page = page,
                pageSize = pageSize,
                categoryId = categoryId,
                minPrice = minPrice,
                maxPrice = maxPrice
            });
        }

        public IActionResult Privacy()
        {
            return View();
        }

        public IActionResult Checkout()
        {
            return View(new CheckoutViewModel());
        }

        public IActionResult EmptyCartError()
        {
            return View("Error", new ErrorViewModel
            {
                Title = "Giỏ hàng trống!",
                Message = "Bạn chưa có sản phẩm nào trong giỏ hàng. Vui lòng thêm sản phẩm trước khi thanh toán.",
                Icon = "fa-shopping-cart",
                IconColor = "text-orange-400"
            });
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
