using Microsoft.AspNetCore.Mvc;
using mvc_razor.Models;
using mvc_razor.Data;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace mvc_razor.Controllers
{
    public class CheckoutController : Controller
    {
        private readonly ILogger<CheckoutController> _logger;
        private readonly ApplicationDbContext _context;

        public CheckoutController(ILogger<CheckoutController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult PlaceOrder([FromBody] CheckoutRequest request)
        {
            // Log thông tin đơn hàng
            _logger.LogInformation("========== ĐƠN HÀNG MỚI ==========");
            _logger.LogInformation($"Khách hàng: {request.CustomerName}");
            _logger.LogInformation($"Số điện thoại: {request.PhoneNumber}");
            _logger.LogInformation($"Email: {request.Email}");
            _logger.LogInformation($"Địa chỉ: {request.Address}");
            _logger.LogInformation($"Phương thức thanh toán: {request.PaymentMethod}");
            _logger.LogInformation($"Ghi chú: {request.Note}");
            _logger.LogInformation($"Giảm giá: {request.PromoDiscount * 100}%");
            _logger.LogInformation($"Thời gian: {request.CreatedAt}");

            _logger.LogInformation("--- Danh sách sản phẩm ---");
            decimal totalAmount = 0;
            foreach (var item in request.Items)
            {
                var itemTotal = item.Price * item.Quantity;
                totalAmount += itemTotal;
                _logger.LogInformation($"  - {item.Name} x{item.Quantity} = {itemTotal:N0}đ (Đơn giá: {item.Price:N0}đ)");
            }

            var discountAmount = totalAmount * request.PromoDiscount;
            var finalTotal = totalAmount - discountAmount;

            _logger.LogInformation($"--- Tổng tiền ---");
            _logger.LogInformation($"Tạm tính: {totalAmount:N0}đ");
            _logger.LogInformation($"Giảm giá: -{discountAmount:N0}đ");
            _logger.LogInformation($"Thành tiền: {finalTotal:N0}đ");
            _logger.LogInformation("===================================");

            // Tạo mã đơn hàng
            var orderId = "SH" + DateTimeOffset.Now.ToUnixTimeMilliseconds().ToString().Substring(5);

            return Json(new
            {
                success = true,
                orderId = orderId,
                message = "Đặt hàng thành công!"
            });
        }
    }

    // Model nhận data từ form checkout
    public class CheckoutRequest
    {
        public string CustomerName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
        public List<CartItem> Items { get; set; } = new();
        public decimal PromoDiscount { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
    }

    public class CartItem
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }
}
