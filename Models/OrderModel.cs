using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


[Table("orders")]
public class OrderModel
{
    [Key]
    [Column("order_id")]
    public int OrderId { get; set; }

    [Column("customer_id")]
    public int? CustomerId { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("promo_id")]
    public int? PromoId { get; set; }

    [Column("order_date")]
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    [Column("status")]
    [MaxLength(10)]
    public string Status { get; set; } = "pending";

    [Column("total_amount", TypeName = "decimal(10,2)")]
    public decimal TotalAmount { get; set; }

    [Column("discount_amount", TypeName = "decimal(10,2)")]
    public decimal DiscountAmount { get; set; } = 0;

    [ForeignKey("CustomerId")]
    public CustomerModel Customer { get; set; }


    [ForeignKey("PromoId")]
    public PromotionModel? Promotion { get; set; }

    public ICollection<OrderItemModel> OrderItems { get; set; } = new List<OrderItemModel>();
    public ICollection<PaymentModel> Payments { get; set; } = new List<PaymentModel>();
}