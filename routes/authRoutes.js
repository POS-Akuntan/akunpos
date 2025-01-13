const express = require('express');
const { register, login, getAllUsers, updateUser, deleteUser, toggleActiveStatus, changePassword } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const passport = require('../middleware/authGoogle');
const jwt = require('jsonwebtoken');
const router = express.Router();
 
router.post('/register', authenticate, authorize(['admin']), register);
router.post('/login', login);
router.get('/users', authenticate, authorize(['admin']), getAllUsers);
router.put('/users/:id', authenticate, authorize(['admin']), updateUser);
router.delete('/users/:id', authenticate, authorize(['admin']), deleteUser);
// Rute untuk menonaktifkan atau mengaktifkan kasir
router.put('/users/:id/active', authenticate, authorize(['admin']), toggleActiveStatus);
router.put('/users/:id/change-password',authenticate, changePassword);

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
            { id_users: user.id_users, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

         // Menentukan URL redirect berdasarkan role
        let redirectUrl = '';
        if (user.role === 'admin') {
            redirectUrl = `https://pos-akuntan.github.io/adminpage?token=${token}&id=${user.id}&name=${user.name}&email=${user.email}&role=${user.role}`;
        } else if (user.role === 'kasir') {
            redirectUrl = `https://pos-akuntan.github.io/db?token=${token}&id=${user.id}&name=${user.name}&email=${user.email}&role=${user.role}`;
        } else {
            // Jika tidak ada role yang sesuai, redirect ke halaman default atau login ulang
            redirectUrl = '/login';
        }

        // Redirect ke URL yang sesuai dengan role
        res.redirect(redirectUrl);
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
