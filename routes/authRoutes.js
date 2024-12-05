const express = require('express');
const { register, login, getAllUsers, updateUser, deleteUser } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const passport = require('../middleware/authGoogle');
const jwt = require('jsonwebtoken');
const router = express.Router();
 
router.post('/register', register);
router.post('/login', login);
router.get('/users', authenticate, authorize(['admin']), getAllUsers);
router.put('/users/:id', authenticate, authorize(['admin']), updateUser);
router.delete('/users/:id', authenticate, authorize(['admin']), deleteUser);

// Endpoint untuk login Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Endpoint callback Google
// router.get(
//     '/google/callback',
//     passport.authenticate('google', { failureRedirect: '/login' }),
//     (req, res) => {
//         // Generate JWT token
//         const user = req.user; // `req.user` berasal dari Passport
//         const token = jwt.sign(
//             { id: user.id, email: user.email, role: user.role },
//             process.env.JWT_SECRET,
//             { expiresIn: '8h' }
//         );

//         // Kirim respons dengan token dan informasi pengguna
//         res.status(200).json({
//             message: 'Login Google berhasil.',
//             token,
//             user: {
//                 id: user.id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//             },
//         });
//     }
// );

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const user = req.user; // `req.user` berasal dari Passport
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Opsi 1: Kirim token melalui JSON (frontend harus memproses respons ini)
        res.status(200).json({
            message: 'Login Google berhasil.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

        // Opsi 2: Redirect dengan token di query string (gunakan jika frontend tidak menangani JSON)
        // res.redirect(`/dashboard?token=${token}`);
    }
);



// Logout
// router.get('/logout', (req, res) => {
//     req.logout(err => {
//         if (err) return res.status(500).json({ error: 'Gagal logout.' });
//         res.status(200).json({ message: 'Logout berhasil.' });
//     });
// });

router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) return res.status(500).json({ error: 'Gagal logout.' });

        // Opsional: Tambahkan logika untuk menghapus session jika ada
        res.status(200).json({ message: 'Logout berhasil.' });
    });
});


module.exports = router;
