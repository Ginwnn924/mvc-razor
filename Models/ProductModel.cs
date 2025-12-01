using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


[Table("products")]
public class ProductModel
{
    [Key]
    [Column("product_id")]
    public int ProductId { get; set; }

    [Column("category_id")]
    public int? CategoryId { get; set; }

    [Column("supplier_id")]
    public int? SupplierId { get; set; }

    [Column("product_name")]
    [Required]
    [MaxLength(100)]
    public string ProductName { get; set; } = string.Empty;

    [Column("barcode")]
    [MaxLength(50)]
    public string? Barcode { get; set; }

    [Column("price", TypeName = "decimal(10,0)")]
    public long Price { get; set; }

    [Column("unit")]
    [MaxLength(20)]
    public string Unit { get; set; } = "pcs";

    [Column("image_url")]
    [MaxLength(255)]
    public string? ImageUrl { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("CategoryId")]
    public CategoryModel? Category { get; set; }


    [Column("is_deleted")]
    public bool IsDeleted { get; set; }

    public InventoryModel? Inventory { get; set; }
    public ICollection<OrderItemModel> OrderItems { get; set; } = new List<OrderItemModel>();
}