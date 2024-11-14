package handlers

import (
    "context"
    "akunpos/database"
    "akunpos/models"
    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    "log"
)

// GetProducts retrieves all products from the database
func GetProducts(c *gin.Context) {
    // Query untuk mengambil data produk
    query := "SELECT id, name, description, price, stock, category FROM products"

    // Eksekusi query tanpa prepared statement
    rows, err := database.DB.Query(context.Background(), query)
    if err != nil {
        log.Println("Error querying database:", err)
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    defer rows.Close()

    var products []models.Product
    for rows.Next() {
        var p models.Product
        // Membaca hasil query
        if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.Category); err != nil {
            log.Println("Error scanning rows:", err)
            c.JSON(500, gin.H{"error": err.Error()})
            return
        }
        products = append(products, p)
    }

    // Cek apakah ada error setelah selesai membaca hasil
    if err := rows.Err(); err != nil {
        log.Println("Error during row iteration:", err)
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    // Kirimkan response dengan data produk
    c.JSON(200, products)
}

// CreateProduct creates a new product in the database
func CreateProduct(c *gin.Context) {
    var p models.Product
    if err := c.BindJSON(&p); err != nil {
        c.JSON(400, gin.H{"error": "Invalid input"})
        return
    }

    // Generate UUID untuk produk baru
    p.ID = uuid.New()

    // Query untuk insert produk
    query := `INSERT INTO products (id, name, description, price, stock, category) 
              VALUES ($1, $2, $3, $4, $5, $6)`

    // Eksekusi query insert
    _, err := database.DB.Exec(context.Background(), query, p.ID, p.Name, p.Description, p.Price, p.Stock, p.Category)
    if err != nil {
        log.Println("Error executing query:", err)
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    // Kirimkan response bahwa produk berhasil dibuat
    c.JSON(201, gin.H{"status": "Product created", "product_id": p.ID})
}

// UpdateProduct updates an existing product in the database
func UpdateProduct(c *gin.Context) {
    var p models.Product
    if err := c.BindJSON(&p); err != nil {
        c.JSON(400, gin.H{"error": "Invalid input"})
        return
    }

    // Ambil ID produk dari parameter URL
    id := c.Param("id")

    // Query untuk update produk berdasarkan ID
    query := `UPDATE products SET name = $1, description = $2, price = $3, stock = $4, category = $5 
              WHERE id = $6`

    // Eksekusi query update
    _, err := database.DB.Exec(context.Background(), query, p.Name, p.Description, p.Price, p.Stock, p.Category, id)
    if err != nil {
        log.Println("Error executing query:", err)
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    // Kirimkan response bahwa produk berhasil diperbarui
    c.JSON(200, gin.H{"status": "Product updated", "product_id": id})
}

// DeleteProduct deletes a product from the database
func DeleteProduct(c *gin.Context) {
    // Ambil ID produk dari parameter URL
    id := c.Param("id")

    // Query untuk menghapus produk berdasarkan ID
    query := `DELETE FROM products WHERE id = $1`

    // Eksekusi query delete
    _, err := database.DB.Exec(context.Background(), query, id)
    if err != nil {
        log.Println("Error executing query:", err)
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    // Kirimkan response bahwa produk berhasil dihapus
    c.JSON(200, gin.H{"status": "Product deleted", "product_id": id})
}
