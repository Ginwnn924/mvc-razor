# Database Setup Instructions

## Connection Details
- **Host:** localhost
- **Port:** 3306
- **Username:** root
- **Password:** 123456
- **Database:** store_management

## Setup Steps

### 1. Create the Database
```sql
CREATE DATABASE IF NOT EXISTS store_management;
USE store_management;
```

### 2. Create Tables
Run the following SQL to create the necessary tables:

```sql
-- Categories Table
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL
);

-- Products Table
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT,
    supplier_id INT,
    product_name VARCHAR(100) NOT NULL,
    barcode VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'pcs',
    image_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Inventory Table
CREATE TABLE inventory (
    inventory_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    quantity INT DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Customers Table
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2),
    status VARCHAR(50),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Order Items Table
CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Payments Table
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    payment_method VARCHAR(50),
    amount DECIMAL(10,2),
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Promotions Table
CREATE TABLE promotions (
    promotion_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT,
    discount_percent DECIMAL(5,2),
    start_date DATETIME,
    end_date DATETIME,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
```

### 3. Insert Sample Data

```sql
-- Insert Categories
INSERT INTO categories (category_name) VALUES
('Electronics'),
('Clothing'),
('Home & Garden'),
('Sports'),
('Books');

-- Insert Products
INSERT INTO products (category_id, product_name, price, unit, image_url) VALUES
(1, 'Premium Wireless Headphones', 79.99, 'pcs', 'https://via.placeholder.com/300x200?text=Headphones'),
(1, 'Smart Watch Pro', 199.99, 'pcs', 'https://via.placeholder.com/300x200?text=SmartWatch'),
(1, '4K Webcam', 64.99, 'pcs', 'https://via.placeholder.com/300x200?text=Webcam'),
(1, 'Mechanical Keyboard RGB', 129.99, 'pcs', 'https://via.placeholder.com/300x200?text=Keyboard'),
(1, 'USB-C Hub 7-in-1', 42.99, 'pcs', 'https://via.placeholder.com/300x200?text=USBHub'),
(1, 'Portable SSD 1TB', 89.99, 'pcs', 'https://via.placeholder.com/300x200?text=SSD'),
(1, 'Wireless Mouse Pro', 34.99, 'pcs', 'https://via.placeholder.com/300x200?text=Mouse'),
(1, 'LED Monitor 27"', 224.99, 'pcs', 'https://via.placeholder.com/300x200?text=Monitor'),
(1, 'Laptop Stand Aluminum', 39.99, 'pcs', 'https://via.placeholder.com/300x200?text=LaptopStand'),
(1, 'Desk Lamp LED', 29.99, 'pcs', 'https://via.placeholder.com/300x200?text=DeskLamp'),
(1, 'Phone Stand Adjustable', 17.99, 'pcs', 'https://via.placeholder.com/300x200?text=PhoneStand'),
(1, 'Cable Organizer Set', 14.99, 'pcs', 'https://via.placeholder.com/300x200?text=CableOrganizer'),
(2, 'Cotton T-Shirt', 19.99, 'pcs', 'https://via.placeholder.com/300x200?text=TShirt'),
(2, 'Denim Jeans', 49.99, 'pcs', 'https://via.placeholder.com/300x200?text=Jeans'),
(3, 'Garden Tool Set', 34.99, 'pcs', 'https://via.placeholder.com/300x200?text=GardenTools'),
(4, 'Yoga Mat', 24.99, 'pcs', 'https://via.placeholder.com/300x200?text=YogaMat'),
(5, 'Programming Book', 39.99, 'pcs', 'https://via.placeholder.com/300x200?text=Book');

-- Insert Inventory
INSERT INTO inventory (product_id, quantity) VALUES
(1, 50), (2, 30), (3, 45), (4, 25), (5, 60),
(6, 35), (7, 55), (8, 15), (9, 40), (10, 70),
(11, 80), (12, 90), (13, 100), (14, 50), (15, 30),
(16, 25), (17, 40);
```

### 4. Verify the Data
```sql
SELECT * FROM products;
SELECT * FROM inventory;
SELECT * FROM categories;
```

## Running the Application

1. **Restore NuGet Packages:**
   ```bash
   dotnet restore
   ```

2. **Run the Application:**
   ```bash
   dotnet run
   ```

3. **Access the Application:**
   Open your browser and navigate to `https://localhost:5001` or `http://localhost:5000`

## Features Implemented

✅ **Database Connection** - MySQL connection configured
✅ **Product Display** - Products loaded from database
✅ **Pagination** - 12 products per page with navigation
✅ **Stock Management** - Shows available inventory
✅ **Add to Cart** - Client-side cart with localStorage
✅ **Wishlist** - Save favorite products
✅ **Responsive Design** - Works on all devices
✅ **Tailwind CSS** - Modern styling

## Troubleshooting

### Connection Issues
- Verify MySQL is running
- Check connection string in `appsettings.json`
- Ensure database `store_management` exists

### No Products Showing
- Verify products table has data
- Check database connection
- Review browser console for errors

### Cart Not Working
- Check browser localStorage is enabled
- Clear browser cache and try again
- Check browser console for JavaScript errors
