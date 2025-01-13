const jwt = require('jsonwebtoken');

// Middleware untuk autentikasi token
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Simpan data pengguna dari token di req.user
        next();
    } catch (err) {
        res.status(403).json({ error: 'Token tidak valid atau sudah kedaluwarsa.' });
    }
};

// Middleware untuk otorisasi role
const authorize = (roles) => {
    // roles bisa berupa string atau array
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Autentikasi diperlukan.' });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'Akses ditolak. Anda tidak memiliki izin.' });
        }

        next(); // Lanjutkan jika role sesuai
    };
};

module.exports = {
    authenticate,
    authorize,
};
