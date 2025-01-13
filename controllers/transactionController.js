const pool = require('../config/db');
const Joi = require('joi'); // Untuk validasi data menggunakan Joi

// Schema validasi transaksi menggunakan Joi
const transactionSchema = Joi.object({
    payment_method: Joi.string(), // Metode pembayaran: cash atau card
    transaction_date: Joi.date().default(() => new Date()), // Default ke waktu saat ini
    total_amount: Joi.number().min(0).default(0), // Total transaksi opsional, default 0
    customer_name: Joi.string()
            .required()
            .min(0)
            .max(100)
            .pattern(/^[a-zA-Z\s]*$/) // Validasi agar hanya huruf dan spasi yang diperbolehkan
            .messages({
                'string.pattern.base': 'Customer name must not contain numbers',
            }),
    customer_phone: Joi.number().integer(),
    table_number: Joi.number().integer().required(),
});

exports.createTransaction = async (req, res) => {
    const { error, value } = transactionSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { payment_method, transaction_date, total_amount, customer_name, customer_phone, table_number } = value;
    const id_users = req.user.id_users; // Ambil user_id dari token

    try {
        const result = await pool.query(
            `INSERT INTO transactions (id_users, total_amount, payment_method, transaction_date, customer_name, customer_phone, table_number) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [id_users, total_amount, payment_method, transaction_date, customer_name, customer_phone, table_number]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




exports.getTransactions = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT transactions.*, users.name AS user_name
            FROM transactions
            JOIN users ON transactions.id_users = users.id_users
            ORDER BY transactions.transaction_date DESC
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getTransactionById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT transactions.*, users.name AS user_name
            FROM transactions
            JOIN users ON transactions.id_users = users.id_users
            WHERE id_transactions = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.updateTransaction = async (req, res) => {
    const { id } = req.params;

    const { error, value } = transactionSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { payment_method, transaction_date, total_amount, customer_name, customer_phone, table_number } = value;
    const user_id = req.user.id; // Ambil user_id dari token

    try {
        const result = await pool.query(
            `UPDATE transactions 
            SET id_users = $1, total_amount = $2, payment_method = $3, transaction_date = $4, customer_name = $5, customer_phone = $6, table_number = $7, updated_at = NOW() 
             WHERE id_transactions = $8 RETURNING *`,
            [user_id, total_amount, payment_method, transaction_date, customer_name, customer_phone, table_number, id]
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
        const result = await pool.query('DELETE FROM transactions WHERE id_transactions = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

