namespace mvc_razor.Models
{
    public class CheckoutViewModel
    {
        public string CustomerName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = "cod"; // cod hoặc online
        public string? Note { get; set; }
    }
}
