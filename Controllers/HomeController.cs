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
                    .OrderByDescending(p => p.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Get all categories for filter
                var categories = await _context.Categories.ToListAsync();

                // Pass data to ViewBag for sidebar and search box
                ViewBag.Categories = categories;
                ViewBag.SelectedCategoryId = categoryId;
                ViewBag.MinPrice = minPrice;
                ViewBag.MaxPrice = maxPrice;
                ViewBag.SearchQuery = searchQuery;
                ViewBag.MinRating = minRating;

                // Create view model
                var viewModel = new ProductListViewModel
                {
                    Products = products,
                    Categories = categories,
                    CurrentPage = page,
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

        public async Task<IActionResult> Details(int id)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Inventory)
                    .FirstOrDefaultAsync(p => p.ProductId == id);

                if (product == null)
                {
                    return NotFound();
                }

                // Get related products (same category)
                var relatedProducts = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Inventory)
                    .Where(p => p.CategoryId == product.CategoryId && p.ProductId != id)
                    .Take(4)
                    .ToListAsync();

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
