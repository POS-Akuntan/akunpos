// Model sebagai dokumentasi atau validasi
const Product = {
    id: 'UUID',               // ID unik (Primary Key)
    name: 'VARCHAR',          // Nama produk
    description: 'TEXT',      // Deskripsi produk
    price: 'NUMERIC',         // Harga produk
    stock: 'INTEGER',         // Stok tersedia
    category: 'VARCHAR',      // Kategori produk
    created_at: 'TIMESTAMP',  // Tanggal pembuatan
    updated_at: 'TIMESTAMP',  // Tanggal pembaruan
};

module.exports = Product;
