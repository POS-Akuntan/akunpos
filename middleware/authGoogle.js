const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../config/db'); // Pastikan ini sesuai dengan konfigurasi database Anda

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'https://pos-ochre.vercel.app/api/auth/google/callback', // Sesuaikan dengan URL aplikasi Anda
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const name = profile.displayName;

                // Cek apakah user sudah ada di database
                let user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
                if (user.rows.length === 0) {
                    // Jika user belum ada, buat baru
                    user = await pool.query(
                        `INSERT INTO users (id_users, name, email, role, created_at, updated_at)
                        VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW()) RETURNING id_users, name, email, role`,
                        [name, email, 'users']
                    );
                } else {
                    user = user.rows[0];
                }

                done(null, user); // Lanjutkan ke handler Passport
            } catch (err) {
                done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id_users);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await pool.query('SELECT * FROM users WHERE id_users = $1', [id]);
        done(null, user.rows[0]);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
