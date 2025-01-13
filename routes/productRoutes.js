const express = require('express');
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductByCategoryId,
} = require('../controllers/productController');
const { authenticate } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

// Tambah produk baru (hanya untuk admin)
router.post('/products', upload, authenticate,  createProduct);

// Ambil semua produk
router.get('/products', getProducts);

// Ambil produk berdasarkan ID
router.get('/products/:id', getProductById);

// Update produk berdasarkan ID (hanya untuk admin)
router.put('/products/:id', upload, authenticate, updateProduct);

// Hapus produk berdasarkan ID (hanya untuk admin)
router.delete('/products/:id', authenticate, deleteProduct);

router.get('/products/category/:id_categories', getProductByCategoryId);


module.exports = router;
