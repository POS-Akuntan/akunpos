// Model sebagai dokumentasi atau validasi
const Transaction = {
    id: 'UUID',               // ID unik (Primary Key)
    user_id: 'UUID',          // ID pengguna (relasi ke tabel users)
    total_amount: 'NUMERIC',  // Total nilai transaksi
    payment_method: 'VARCHAR',// Metode pembayaran (misal: cash, card)
    transaction_date: 'TIMESTAMP', // Tanggal transaksi
    created_at: 'TIMESTAMP',  // Tanggal pembuatan
    updated_at: 'TIMESTAMP',  // Tanggal pembaruan
};

module.exports = Transaction;
