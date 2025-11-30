namespace mvc_razor.Models
{
    public class ErrorViewModel
    {
        public string? RequestId { get; set; }
        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);

        // Custom error properties
        public string? Title { get; set; }
        public string? Message { get; set; }
        public string? Icon { get; set; }
        public string? IconColor { get; set; }
    }
}
