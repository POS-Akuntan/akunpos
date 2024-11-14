package database

import (
    "context"
    "log"
    "os"

    "github.com/jackc/pgx/v5/pgxpool"
    "github.com/joho/godotenv"
)

var DB *pgxpool.Pool

func ConnectDB() {
    // Memuat variabel lingkungan dari .env
    err := godotenv.Load()
    if err != nil {
        log.Fatalf("Error loading .env file")
    }

    // Mengambil URL database dari environment variable
    dbURL := os.Getenv("SUPABASE_URL")
    config, err := pgxpool.ParseConfig(dbURL)
    if err != nil {
        log.Fatalf("Unable to parse DB config: %v\n", err)
    }

    // Membuat pool koneksi ke database
    DB, err = pgxpool.NewWithConfig(context.Background(), config)
    if err != nil {
        log.Fatalf("Unable to create DB pool: %v\n", err)
    }
    log.Println("Database connected successfully.")
}

func CloseDB() {
    if DB != nil {
        DB.Close()
    }
}