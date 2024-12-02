const express = require('express');
const {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
} = require('../controllers/transactionController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Tambah transaksi baru
router.post('/transactions', authenticate, createTransaction);

// Ambil semua transaksi
router.get('/transactions', authenticate, getTransactions);

// Ambil transaksi berdasarkan ID
router.get('/transactions/:id', authenticate, getTransactionById);

// Update transaksi berdasarkan ID
router.put('/transactions/:id', authenticate, updateTransaction);

// Hapus transaksi berdasarkan ID
router.delete('/transactions/:id', authenticate, deleteTransaction);

module.exports = router;
