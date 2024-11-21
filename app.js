require('dotenv').config();
const express = require('express');
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi CORS
app.use(cors());


// Middleware
app.use(express.json());

// Routes
app.use('/api', productRoutes);
app.use('/api', transactionRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
