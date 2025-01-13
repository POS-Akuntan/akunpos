const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Fungsi Register
const register = async (req, res) => {
    const { name, email, password, role, phone_number } = req.body;

    try {
        // Cek apakah email sudah digunakan
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email sudah digunakan.' });
        }

        // Cek apakah nomor telepon sudah digunakan (opsional)
        if (phone_number) {
            const existingPhone = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
            if (existingPhone.rows.length > 0) {
                return res.status(400).json({ error: 'Nomor telepon sudah digunakan.' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Set nilai default is_active = true
        const isActive = 'true';

        // Simpan user ke database
        const result = await pool.query(
            `INSERT INTO users (id_users, name, email, password, role, phone_number, is_active, created_at, updated_at)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id_users, name, email, role, phone_number, is_active`,
            [name, email, hashedPassword, role || 'kasir', phone_number, isActive]
        );

        res.status(201).json({
            message: 'Registrasi berhasil.',
            user: result.rows[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal registrasi pengguna.', details: err.message });
    }
};



// Fungsi Login
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Cari pengguna berdasarkan email
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'Email atau password salah.' });
        }

        // Konversi is_active dari string ke boolean
        const isActive = user.is_active === 'true';

        // Cek apakah pengguna aktif
        if (!isActive) {
            return res.status(403).json({ error: 'Akun Anda dinonaktifkan. Silakan hubungi administrator.' });
        }

        // Periksa password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Email atau password salah.' });
        }

        // Buat JWT
        const token = jwt.sign(
            { id_users: user.id_users, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: 'Login berhasil.',
            token,
            user: { 
                id_users: user.id_users, 
                name: user.name, 
                email: user.email, 
                role: user.role, 
                phone_number: user.phone_number,
                is_active: isActive,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal login.', details: err.message });
    }
};



// Fungsi Get All Users
const getAllUsers = async (req, res) => {
    try {
        // Query untuk mendapatkan semua data pengguna
        const result = await pool.query(
            `SELECT id_users, name, email, role, phone_number, created_at, updated_at, is_active FROM users`
        );

        // Jika tidak ada data
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tidak ada pengguna ditemukan.' });
        }

        res.status(200).json({
            message: 'Daftar pengguna berhasil diambil.',
            users: result.rows, // Mengembalikan daftar pengguna
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal mengambil daftar pengguna.', details: err.message });
    }
};

// Fungsi Update User
const updateUser = async (req, res) => {
    const { id } = req.params; // ID pengguna dari parameter URL
    const { name, email, password, role, phone_number } = req.body;

    try {
        // Periksa apakah pengguna ada
        const existingUser = await pool.query('SELECT * FROM users WHERE id_users = $1', [id]);
        if (existingUser.rows.length === 0) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
        }

        // Hash password jika di-update
        let hashedPassword = existingUser.rows[0].password; // Default: gunakan password lama
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Update pengguna
        const result = await pool.query(
            `UPDATE users 
             SET name = $1, email = $2, password = $3, role = $4, phone_number = $5, updated_at = NOW()
             WHERE id_users = $6 
             RETURNING id_users, name, email, role, phone_number, created_at, updated_at`,
            [name, email, hashedPassword, role, phone_number, id]
        );

        res.status(200).json({
            message: 'Pengguna berhasil diperbarui.',
            user: result.rows[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal memperbarui pengguna.', details: err.message });
    }
};

// Fungsi Delete User
const deleteUser = async (req, res) => {
    const { id } = req.params; // ID pengguna dari parameter URL

    try {
        // Periksa apakah pengguna ada
        const existingUser = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (existingUser.rows.length === 0) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
        }

        // Hapus pengguna
        await pool.query('DELETE FROM users WHERE id = $1', [id]);

        res.status(200).json({
            message: 'Pengguna berhasil dihapus.',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal menghapus pengguna.', details: err.message });
    }
};

// Fungsi untuk menonaktifkan atau mengaktifkan kasir
const toggleActiveStatus = async (req, res) => {
    const { id } = req.params; // ID pengguna dari parameter URL
    const { is_active } = req.body; // Status baru untuk is_active

    try {
        // Periksa apakah pengguna ada
        const existingUser = await pool.query('SELECT * FROM users WHERE id_users = $1', [id]);
        if (existingUser.rows.length === 0) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
        }

        // Periksa apakah pengguna adalah kasir (role 'kasir') sebelum mengubah status
        const user = existingUser.rows[0];
        if (user.role !== 'kasir') {
            return res.status(400).json({ error: 'Hanya kasir yang dapat dinonaktifkan.' });
        }

        // Update status is_active
        const result = await pool.query(
            `UPDATE users
             SET is_active = $1, updated_at = NOW()
             WHERE id_users = $2
             RETURNING id_users, name, email, role, phone_number, is_active, created_at, updated_at`,
            [is_active, id]
        );

        res.status(200).json({
            message: 'Status pengguna berhasil diperbarui.',
            user: result.rows[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal memperbarui status pengguna.', details: err.message });
    }
};

// Fungsi Ubah Password
const changePassword = async (req, res) => {
    const { id } = req.params; // ID pengguna dari parameter URL
    const { oldPassword, newPassword } = req.body; // Password lama dan baru dari body request

    try {
        // Periksa apakah pengguna ada
        const result = await pool.query('SELECT * FROM users WHERE id_users = $1', [id]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
        }

        // Periksa apakah password lama benar
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Password lama salah.' });
        }

        // Hash password baru
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password di database
        await pool.query(
            `UPDATE users 
             SET password = $1, updated_at = NOW() 
             WHERE id_users = $2`,
            [hashedNewPassword, id]
        );

        res.status(200).json({
            message: 'Password berhasil diubah.',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal mengubah password.', details: err.message });
    }
};


module.exports = {
    register,
    login,
    getAllUsers,
    updateUser, // Tambahkan fungsi update user
    deleteUser, // Tambahkan fungsi delete user
    toggleActiveStatus,
    changePassword,
};

