const express = require('express');
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Tambah produk baru (hanya untuk admin)
router.post('/products', authenticate, createProduct);

// Ambil semua produk
router.get('/products', getProducts);

// Ambil produk berdasarkan ID
router.get('/products/:id', getProductById);

// Update produk berdasarkan ID (hanya untuk admin)
router.put('/products/:id', authenticate, updateProduct);

// Hapus produk berdasarkan ID (hanya untuk admin)
router.delete('/products/:id', authenticate, deleteProduct);

module.exports = router;
