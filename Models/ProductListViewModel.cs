namespace mvc_razor.Models
{
    public class ProductListViewModel
    {
        public List<ProductModel> Products { get; set; } = new List<ProductModel>();
        public List<ProductModel> BestSaler { get; set; } = new List<ProductModel>();
        public int CurrentPage { get; set; } = 1;
        public int PageSize { get; set; } = 12;
        public int TotalProducts { get; set; }
        public int TotalPages { get; set; }
        public string? SearchQuery { get; set; }
        public int? SelectedCategoryId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
    }
}
