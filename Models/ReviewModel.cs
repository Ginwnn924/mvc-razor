using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("reviews")]
public class ReviewModel
{
    [Key]
    [Column("review_id")]
    public int ReviewId { get; set; }

    [Column("product_id")]
    public int ProductId { get; set; }

    [Column("customer_id")]
    public int? CustomerId { get; set; }

    [Column("rating")]
    public int Rating { get; set; }

    [Column("comment")]
    public string? Comment { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [ForeignKey("ProductId")]
    public ProductModel? Product { get; set; }
}
