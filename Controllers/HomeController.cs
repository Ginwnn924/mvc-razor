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

        public async Task<IActionResult> Index(int page = 1, int pageSize = 12)
        {
            try
            {
                // Get total count
                var totalProducts = await _context.Products.CountAsync();

                // Get products with pagination
                var products = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Inventory)
                    .OrderByDescending(p => p.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Get all categories for filter
                var categories = await _context.Categories.ToListAsync();

                // Create view model
                var viewModel = new ProductListViewModel
                {
                    Products = products,
                    Categories = categories,
                    CurrentPage = page,
                    PageSize = pageSize,
                    TotalProducts = totalProducts,
                    TotalPages = (int)Math.Ceiling((double)totalProducts / pageSize)
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

        public IActionResult Search(string q)
        {
            if (string.IsNullOrWhiteSpace(q))
            {
                return RedirectToAction("Index");
            }

            // TODO: Implement search functionality with database
            ViewData["SearchQuery"] = q;
            return View("Index");
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
