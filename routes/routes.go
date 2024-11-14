// routes/routes.go

package routes

import (
    "akunpos/handlers"

    "github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
    // Route untuk produk
    r.GET("/products", handlers.GetProducts)
    r.POST("/products", handlers.CreateProduct)
	r.PUT("/products/:id", handlers.UpdateProduct)
	r.DELETE("/products/:id", handlers.DeleteProduct)

}
