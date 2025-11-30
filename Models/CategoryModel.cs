using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;



[Table("categories")]
public class CategoryModel
{
    [Key]
    [Column("category_id")]
    public int CategoryId { get; set; }

    [Column("category_name")]
    [Required]
    [MaxLength(100)]
    public string CategoryName { get; set; } = string.Empty;

    public ICollection<ProductModel> Products { get; set; } = new List<ProductModel>();
}