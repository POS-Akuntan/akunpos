const pool = require('../config/db');
const Joi = require('joi'); // Untuk validasi data menggunakan Joi

// Schema validasi transaksi item menggunakan Joi
const transactionItemSchema = Joi.object({
    id_transactions: Joi.string().guid().required(),         // ID transaksi yang valid (relasi ke transactions)
    id_products: Joi.string().guid().required(),              // ID produk yang valid (relasi ke products)
    quantity: Joi.number().integer().required().min(1),      // Jumlah produk yang dibeli (minimal 1)
    unit_price: Joi.number().required().min(0),              // Harga per unit produk
});

// Tambah item transaksi baru
exports.createTransactionItem = async (req, res) => {
    // Validasi input menggunakan Joi
    const { error } = transactionItemSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { id_transactions, id_products, quantity, unit_price } = req.body;

    // 1. Hitung total harga item transaksi
    const itemTotalPrice = quantity * unit_price;

    try {
        // 2. Periksa apakah produk dan transaksi ada di database
        const productResult = await pool.query('SELECT * FROM products WHERE id_products = $1', [id_products]);
        const transactionResult = await pool.query('SELECT * FROM transactions WHERE id_transactions = $1', [id_transactions]);

        if (productResult.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (transactionResult.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const product = productResult.rows[0];
        const transaction = transactionResult.rows[0];

        // 3. Validasi stok produk
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Not enough stock for this product' });
        }

        // 4. Tambahkan item transaksi ke database
        const result = await pool.query(
            `INSERT INTO transaction_items (id_transactions, id_products, quantity, unit_price, total_price) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [id_transactions, id_products, quantity, unit_price, itemTotalPrice]
        );

        // 5. Update total_amount transaksi
        const updatedTotalAmount = parseFloat(transaction.total_amount) + itemTotalPrice;

        // 6. Update transaksi dengan total_amount baru
        await pool.query(
            `UPDATE transactions 
             SET total_amount = $1 
             WHERE id_transactions = $2`,
            [updatedTotalAmount, id_transactions]
        );

        // 7. Kurangi stok produk setelah transaksi
        await pool.query('UPDATE products SET stock = stock - $1 WHERE id_products = $2', [quantity, id_products]);

        // 8. Kembalikan item transaksi yang baru ditambahkan
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




// Ambil semua item dari transaksi dan sertakan nama produk
exports.getTransactionItems = async (req, res) => {
    const { transaction_id } = req.params;

    try {
        const query = `
            SELECT 
                ti.*, 
                p.name AS product_name
            FROM 
                transaction_items ti
            JOIN 
                products p
            ON 
                ti.id_products = p.id_products
            WHERE 
                ti.id_transactions = $1
        `;

        const result = await pool.query(query, [transaction_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No items found for this transaction' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Ambil item transaksi berdasarkan ID dan sertakan nama produk
exports.getTransactionItemById = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT 
                ti.*, 
                p.name AS product_name
            FROM 
                transaction_items ti
            JOIN 
                products p
            ON 
                ti.id_products = p.id_products
            WHERE 
                ti.id_transaction_items = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction item not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update item transaksi berdasarkan ID
exports.updateTransactionItem = async (req, res) => {
    const { id } = req.params;

    // Validasi input menggunakan Joi untuk update
    const { error } = transactionItemSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { id_transactions, id_products, quantity, unit_price } = req.body;

    try {
        // Periksa apakah produk dan transaksi ada di database
        const productResult = await pool.query('SELECT * FROM products WHERE id_products = $1', [id_products]);
        const transactionResult = await pool.query('SELECT * FROM transactions WHERE id_transactions = $1', [id_transactions]);

        if (productResult.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (transactionResult.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Periksa apakah stok produk cukup
        const product = productResult.rows[0];
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Not enough stock for this product' });
        }

        const total_price = quantity * unit_price;

        // Update item transaksi
        const result = await pool.query(
            `UPDATE transaction_items
             SET id_transactions = $1, id_products = $2, quantity = $3, unit_price = $4, total_price = $5
             WHERE id_transaction_items = $6 RETURNING *`,
            [id_transactions, id_products, quantity, unit_price, total_price, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction item not found' });
        }

        // Kurangi stok produk setelah update
        await pool.query('UPDATE products SET stock = stock - $1 WHERE id_products = $2', [quantity, id_products]);

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hapus item transaksi berdasarkan ID
exports.deleteTransactionItem = async (req, res) => {
    const { id } = req.params;

    try {
        // Ambil item transaksi untuk mengembalikan stok produk
        const itemResult = await pool.query('SELECT * FROM transaction_items WHERE id_transaction_items = $1', [id]);
        if (itemResult.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction item not found' });
        }

        const { id_products, quantity } = itemResult.rows[0];

        // Kembalikan stok produk
        await pool.query('UPDATE products SET stock = stock + $1 WHERE id_products = $2', [quantity, id_products]);

        // Hapus item transaksi
        const result = await pool.query('DELETE FROM transaction_items WHERE id_transaction_items = $1 RETURNING *', [id]);

        res.status(200).json({ message: 'Transaction item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
