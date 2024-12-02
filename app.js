require('dotenv').config();
const express = require('express');
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoutes');
const transactionItemsRoutes = require('./routes/transactionItemRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const passport = require('./middleware/authGoogle');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');






const app = express();
const PORT = process.env.PORT || 3000;

// Mengizinkan semua origin
app.use(cors());

// Konfigurasi express-session
app.use(
    session({
      secret: 'your_secret_key', // Ganti dengan kunci rahasia yang aman
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }, // Set 'true' jika menggunakan HTTPS
    })
  );

  app.use(cookieParser());

// Middleware
app.use(express.json());


// Routes
app.use('/api', productRoutes);
app.use('/api', transactionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', transactionItemsRoutes);
app.use('/api', categoryRoutes);
app.use(passport.initialize());
app.use(passport.session());




// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
