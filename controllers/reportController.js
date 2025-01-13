const pool = require('../config/db');

const getSalesReportByCategory = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.name AS category,
                p.name AS product,
                SUM(ti.quantity) AS total_quantity_sold,
                SUM(ti.quantity * p.price) AS total_sales
            FROM 
                transaction_items ti
            JOIN 
                products p ON ti.id_products = p.id_products
            JOIN 
                categories c ON p.id_categories = c.id_categories
            GROUP BY 
                c.name, p.name
            ORDER BY 
                c.name, total_sales DESC;
        `);

        res.status(200).json({
            success: true,
            message: "Sales report by category retrieved successfully",
            data: result.rows, // Mengakses hasil query yang benar
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the sales report",
            error: error.message, // Menyertakan pesan error untuk debug
        });
    }
};

module.exports = {
    getSalesReportByCategory,
};
