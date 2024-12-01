require('dotenv').config();
const express = require('express');
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi CORS
app.use(
  cors({
    origin: ["*"],
    methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);



// Middleware
app.use(express.json());

// Routes
app.use('/api', productRoutes);
app.use('/api', transactionRoutes);

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

//try antonio bonapate INI ANTON
const express = require("express");
const bodyParser = require("body-parser");
const midtransClient = require("midtrans-client");

app.use(bodyParser.json());

// Midtrans configuration
const coreApi = new midtransClient.CoreApi({
  isProduction: false, // Sandbox mode
  serverKey: "YOUR_SERVER_KEY",
  clientKey: "YOUR_CLIENT_KEY",
});

app.post("/create-transaction", async (req, res) => {
  const { order_id, gross_amount, items } = req.body;

  const parameter = {
    transaction_details: {
      order_id: order_id, // Unique ID for each transaction
      gross_amount: gross_amount, // Total payment
    },
    item_details: items, // Array of item objects
    customer_details: {
      first_name: "Customer",
      email: "customer@example.com",
    },
    enabled_payments: ["qris"], // Restrict to QRIS
  };

  try {
    const transaction = await coreApi.createTransaction(parameter);
    res.json({ token: transaction.token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Transaction creation failed.");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));


