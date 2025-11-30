using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


[Table("promotions")]
public class PromotionModel
{
    [Key]
    [Column("promo_id")]
    public int PromoId { get; set; }

    [Column("promo_code")]
    [Required]
    [MaxLength(50)]
    public string PromoCode { get; set; } = string.Empty;

    [Column("description")]
    [MaxLength(255)]
    public string? Description { get; set; }

    [Column("discount_type")]
    [MaxLength(10)]
    public string DiscountType { get; set; } = "percent";

    [Column("discount_value", TypeName = "decimal(10,2)")]
    public decimal DiscountValue { get; set; }

    [Column("start_date")]
    public DateTime StartDate { get; set; }

    [Column("end_date")]
    public DateTime EndDate { get; set; }

    [Column("min_order_amount", TypeName = "decimal(10,2)")]
    public decimal MinOrderAmount { get; set; } = 0;

    [Column("usage_limit")]
    public int UsageLimit { get; set; } = 0;

    [Column("used_count")]
    public int UsedCount { get; set; } = 0;

    [Column("status")]
    [MaxLength(10)]
    public string Status { get; set; } = "active";

    public ICollection<OrderModel> Orders { get; set; } = new List<OrderModel>();
}