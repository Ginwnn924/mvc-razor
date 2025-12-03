namespace mvc_razor.Models
{
    public class ProductRatingInfo
    {
        public int ProductId { get; set; }
        public decimal AverageRating { get; set; }
        public int ReviewCount { get; set; }
    }
}

