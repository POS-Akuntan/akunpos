const express = require('express');
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');

const router = express.Router();

router.post('/products', createProduct);         // Tambah produk baru
router.get('/products', getProducts);           // Ambil semua produk
router.get('/products/:id', getProductById);    // Ambil produk berdasarkan ID
router.put('/products/:id', updateProduct);     // Update produk berdasarkan ID
router.delete('/products/:id', deleteProduct);  // Hapus produk berdasarkan ID

module.exports = router;
