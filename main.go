package main

import (
    "log"
    "akunpos/database"
    "akunpos/routes"
    "github.com/gin-gonic/gin"
)

func main() {
    // Inisialisasi koneksi database
    database.ConnectDB()
    defer database.CloseDB()

    // Inisialisasi Gin router
    r := gin.Default()

    // Setup routes
    routes.SetupRoutes(r)

    // Menjalankan server di port 8080
    if err := r.Run(":8080"); err != nil {
        log.Fatal("Unable to start server:", err)
    }
}
