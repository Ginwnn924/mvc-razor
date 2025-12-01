using Microsoft.EntityFrameworkCore;
using mvc_razor.Models;

namespace mvc_razor.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets for your models
        public DbSet<CategoryModel> Categories { get; set; }
        public DbSet<CustomerModel> Customers { get; set; }
        public DbSet<InventoryModel> Inventory { get; set; }
        public DbSet<OrderModel> Orders { get; set; }
        public DbSet<OrderItemModel> OrderItems { get; set; }
        public DbSet<PaymentModel> Payments { get; set; }
        public DbSet<ProductModel> Products { get; set; }
        public DbSet<PromotionModel> Promotions { get; set; }
        public DbSet<ReviewModel> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Add any additional model configurations here if needed
        }
    }
}
