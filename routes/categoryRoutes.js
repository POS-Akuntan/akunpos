const express = require('express');
const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoriesController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Tambah kategori baru (hanya untuk admin)
router.post('/categories', authenticate, createCategory);

// Ambil semua kategori
router.get('/categories', getCategories);

// Ambil kategori berdasarkan ID
router.get('/categories/:id', getCategoryById);

// Update kategori berdasarkan ID (hanya untuk admin)
router.put('/categories/:id', authenticate, updateCategory);

// Hapus kategori berdasarkan ID (hanya untuk admin)
router.delete('/categories/:id', authenticate, deleteCategory);

module.exports = router;
