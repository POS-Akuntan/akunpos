const pool = require('../config/db');
const Joi = require('joi');

// Schema validasi dengan Joi
const categorySchema = Joi.object({
    name: Joi.string().required().min(3).max(50),      // Nama kategori: minimal 3 karakter
    description: Joi.string().optional().allow(null, '') // Deskripsi kategori: boleh kosong
});

// Tambah kategori baru
exports.createCategory = async (req, res) => {
    // Validasi input menggunakan Joi
    const { error } = categorySchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, description } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO categories (name, description) 
             VALUES ($1, $2) RETURNING *`,
            [name, description]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Duplicate key
            res.status(400).json({ message: 'Category name already exists' });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

// Ambil semua kategori
exports.getCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ambil kategori berdasarkan ID
exports.getCategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM categories WHERE id_categories = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update kategori berdasarkan ID
exports.updateCategory = async (req, res) => {
    const { id } = req.params;

    // Validasi input menggunakan Joi
    const { error } = categorySchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, description } = req.body;

    try {
        // Cek apakah nama kategori sudah ada (kecuali milik ID yang sedang diupdate)
        const nameCheck = await pool.query(
            `SELECT id_categories FROM categories WHERE name = $1 AND id_categories != $2`,
            [name, id]
        );

        if (nameCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Category name already exists' });
        }

        // Lakukan update jika tidak ada konflik nama
        const result = await pool.query(
            `UPDATE categories 
             SET name = $1, description = $2, updated_at = NOW() 
             WHERE id_categories = $3 RETURNING *`,
            [name, description, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Hapus kategori berdasarkan ID
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM categories WHERE id_categories = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
