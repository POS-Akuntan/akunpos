const pool = require('../config/db');
const Joi = require('joi'); // Mengimpor Joi untuk validasi

// Schema validasi dengan Joi
const productSchema = Joi.object({
    name: Joi.string().required().min(3).max(100),        // Nama produk: minimal 3 karakter
    description: Joi.string().optional().allow(null, ''), // Deskripsi produk: boleh kosong
    price: Joi.number().required().min(0),               // Harga produk: minimal 0
    stock: Joi.number().integer().required().min(0),     // Stok produk: minimal 0
    category: Joi.string().required().min(3).max(50),    // Kategori produk: minimal 3 karakter
});

// Tambah produk baru
exports.createProduct = async (req, res) => {
    // Validasi input menggunakan Joi
    const { error } = productSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, description, price, stock, category } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO products (name, description, price, stock, category) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, description, price, stock, category]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ambil semua produk
exports.getProducts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ambil produk berdasarkan ID
exports.getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update produk berdasarkan ID
exports.updateProduct = async (req, res) => {
    const { id } = req.params;

    // Validasi input menggunakan Joi untuk update
    const { error } = productSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, description, price, stock, category } = req.body;

    try {
        const result = await pool.query(
            `UPDATE products 
             SET name = $1, description = $2, price = $3, stock = $4, category = $5, updated_at = NOW() 
             WHERE id = $6 RETURNING *`,
            [name, description, price, stock, category, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hapus produk berdasarkan ID
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
