const express = require('express');
const router = express.Router();
const { getSalesReportByCategory } = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.get('/report', getSalesReportByCategory);

module.exports = router;
