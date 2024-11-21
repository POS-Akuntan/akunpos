const express = require('express');
const {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
} = require('../controllers/transactionController');

const router = express.Router();

router.post('/transactions', createTransaction);           // Tambah transaksi baru
router.get('/transactions', getTransactions);             // Ambil semua transaksi
router.get('/transactions/:id', getTransactionById);      // Ambil transaksi berdasarkan ID
router.put('/transactions/:id', updateTransaction);       // Update transaksi berdasarkan ID
router.delete('/transactions/:id', deleteTransaction);    // Hapus transaksi berdasarkan ID

module.exports = router;
