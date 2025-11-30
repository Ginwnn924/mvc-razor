namespace mvc_razor.Models
{
    public class ProductDetailsViewModel
    {
        public ProductModel Product { get; set; } = null!;
        public List<ProductModel> RelatedProducts { get; set; } = new List<ProductModel>();
    }
}
