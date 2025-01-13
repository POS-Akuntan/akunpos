const pool = require('../config/db');
const Joi = require('joi'); // Mengimpor Joi untuk validasi
const { uploadImageToStorage } = require('./uploadService'); // Import fungsi upload gambar

// Schema validasi dengan Joi
const productSchema = Joi.object({
    name: Joi.string()
        .required()
        .min(3)
        .max(100)
        .pattern(/^[a-zA-Z\s]*$/) // Validasi agar hanya huruf dan spasi yang diperbolehkan
        .messages({
            'string.pattern.base': 'Product name must not contain numbers',
        }),
    description: Joi.string().optional().allow(null, ''), // Deskripsi produk: boleh kosong
    price: Joi.number().required().min(0).messages({ 'number.min': 'Price cannot be negative' }), // Harga produk: minimal 0
    stock: Joi.number().integer().required().min(0).messages({ 'number.min': 'Stock cannot be negative' }), // Stok produk: minimal 0
    id_categories: Joi.string().required().min(3).max(50), // Kategori produk: minimal 3 karakter
});

// Tambah produk baru
exports.createProduct = async (req, res) => {
    const { name, description, price, stock, id_categories } = req.body;
    const picture = req.file;

    try {
        // Validasi input menggunakan Joi
        const { error } = productSchema.validate({
            name,
            description,
            price,
            stock,
            id_categories,
        });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Cek apakah kategori produk ada
        const categoryResult = await pool.query('SELECT * FROM categories WHERE id_categories = $1', [id_categories]);
        if (categoryResult.rows.length === 0) {
            return res.status(400).json({ message: 'Category not found' });
        }

        // Cek apakah produk sudah ada dengan nama yang sama
        const productCheck = await pool.query('SELECT * FROM products WHERE name = $1', [name]);
        if (productCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Product with the same name already exists' });
        }

        let pictureName = null;
        if (picture) {
            pictureName = await uploadImageToStorage(picture, name);
        }

        // Masukkan produk ke database
        const result = await pool.query(
            `INSERT INTO products (name, description, price, stock, id_categories, picture) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, description, price, stock, id_categories, pictureName || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Ambil semua produk
exports.getProducts = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.id_products,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.id_categories, 
                c.name AS category_name,
                p.picture
            FROM 
                products p
            JOIN 
                categories c ON p.id_categories = c.id_categories
            ORDER BY 
                p.created_at DESC
        `);

        const products = result.rows.map(product => ({
            ...product,
            picture_url: product.picture ? `${process.env.SUPABASE}/storage/v1/object/public/image/public/${product.picture}` : null,
        }));

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ambil produk berdasarkan ID
exports.getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT 
                p.id_products,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.id_categories, 
                c.name AS category_name,
                p.picture
            FROM 
                products p
            JOIN 
                categories c ON p.id_categories = c.id_categories
            WHERE 
                p.id_products = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = result.rows[0];
        product.picture_url = product.picture ? `${process.env.SUPABASE}/storage/v1/object/public/image/public/${product.picture}` : null;

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update produk berdasarkan ID
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, id_categories } = req.body;
    const picture = req.file;

    try {
        // Validasi input menggunakan Joi
        const { error } = productSchema.validate({
            name,
            description,
            price,
            stock,
            id_categories,
        });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const categoryResult = await pool.query('SELECT * FROM categories WHERE id_categories = $1', [id_categories]);
        if (categoryResult.rows.length === 0) {
            return res.status(400).json({ message: 'Category not found' });
        }

        const productCheck = await pool.query(
            'SELECT * FROM products WHERE name = $1 AND id_products != $2',
            [name, id]
        );
        if (productCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Product with the same name already exists' });
        }

        let pictureName = null;
        if (picture) {
            pictureName = await uploadImageToStorage(picture, name);
        }

        const result = await pool.query(
            `UPDATE products 
             SET name = $1, description = $2, price = $3, stock = $4, id_categories = $5, 
                 picture = COALESCE($6, picture), updated_at = NOW() 
             WHERE id_products = $7 RETURNING *`,
            [name, description, price, stock, id_categories, pictureName || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hapus produk berdasarkan ID
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const transactionResult = await pool.query('SELECT * FROM transaction_items WHERE id_products = $1', [id]);
        if (transactionResult.rows.length > 0) {
            return res.status(400).json({ message: 'Product cannot be deleted because it has associated transactions' });
        }

        const result = await pool.query('DELETE FROM products WHERE id_products = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Ambil produk berdasarkan id_categories
exports.getProductByCategoryId = async (req, res) => {
    const { id_categories } = req.params;

    try {
        // Cek apakah kategori produk ada
        const categoryResult = await pool.query('SELECT * FROM categories WHERE id_categories = $1', [id_categories]);
        if (categoryResult.rows.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Ambil produk berdasarkan kategori
        const result = await pool.query(`
            SELECT 
                p.id_products,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.id_categories, 
                c.name AS category_name,
                p.picture
            FROM 
                products p
            JOIN 
                categories c ON p.id_categories = c.id_categories
            WHERE 
                p.id_categories = $1
            ORDER BY 
                p.created_at DESC
        `, [id_categories]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No products found for the given category' });
        }

        // Tambahkan URL gambar jika `picture` tidak null
        const products = result.rows.map(product => ({
            ...product,
            picture_url: product.picture ? `${process.env.SUPABASE}/storage/v1/object/public/image/public/${product.picture}` : null
        }));

        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
