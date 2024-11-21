const pool = require('../config/db');
const Joi = require('joi'); // Untuk validasi data menggunakan Joi

// Schema validasi transaksi menggunakan Joi
const transactionSchema = Joi.object({
    user_id: Joi.string().guid().required(),               // ID pengguna harus UUID yang valid
    total_amount: Joi.number().required().min(0),           // Total transaksi minimal 0
    payment_method: Joi.string().valid('cash', 'card').required(), // Metode pembayaran: cash atau card
    transaction_date: Joi.date().required(),                // Tanggal transaksi harus valid
});

// Tambah transaksi baru
exports.createTransaction = async (req, res) => {
    // Validasi input menggunakan Joi
    const { error } = transactionSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { user_id, total_amount, payment_method, transaction_date } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO transactions (user_id, total_amount, payment_method, transaction_date) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [user_id, total_amount, payment_method, transaction_date]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ambil semua transaksi
exports.getTransactions = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM transactions ORDER BY transaction_date DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ambil transaksi berdasarkan ID
exports.getTransactionById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update transaksi berdasarkan ID
exports.updateTransaction = async (req, res) => {
    const { id } = req.params;

    // Validasi input menggunakan Joi untuk update transaksi
    const { error } = transactionSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { user_id, total_amount, payment_method, transaction_date } = req.body;

    try {
        const result = await pool.query(
            `UPDATE transactions 
             SET user_id = $1, total_amount = $2, payment_method = $3, transaction_date = $4, updated_at = NOW() 
             WHERE id = $5 RETURNING *`,
            [user_id, total_amount, payment_method, transaction_date, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hapus transaksi berdasarkan ID
exports.deleteTransaction = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM transactions WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
