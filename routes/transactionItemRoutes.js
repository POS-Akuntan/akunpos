const express = require('express');
const {
    createTransactionItem,
    getTransactionItems,
    getTransactionItemById,
    updateTransactionItem,
    deleteTransactionItem,
} = require('../controllers/transactionItemController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Tambah item transaksi baru
router.post('/transaction-items', authenticate, createTransactionItem);

// Ambil semua item berdasarkan transaction_id
router.get('/transaction-items/:transaction_id', authenticate, getTransactionItems);

// Ambil item transaksi berdasarkan ID
router.get('/transaction-items/item/:id', authenticate, getTransactionItemById);

// Update item transaksi berdasarkan ID
router.put('/transaction-items/item/:id', authenticate, updateTransactionItem);

// Hapus item transaksi berdasarkan ID
router.delete('/transaction-items/item/:id', authenticate, deleteTransactionItem);

module.exports = router;
