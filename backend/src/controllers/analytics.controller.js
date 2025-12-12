const db = require('../config/db');

const getDashboardSummary = async (req, res) => {
  try {
    const { company_id } = req.user;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

    const [todaySales] = await db.query('SELECT SUM(total) as total, COUNT(*) as count FROM sales WHERE DATE(sale_date) = ? AND company_id = ?', [today, company_id]);
    
    // Current Month
    const [monthSales] = await db.query('SELECT SUM(total) as total, COUNT(*) as count FROM sales WHERE DATE(sale_date) >= ? AND company_id = ?', [firstDayOfMonth, company_id]);
    
    // Last Month (For Comparison)
    const [lastMonthSales] = await db.query('SELECT SUM(total) as total, COUNT(*) as count FROM sales WHERE DATE(sale_date) BETWEEN ? AND ? AND company_id = ?', [firstDayOfLastMonth, lastDayOfLastMonth, company_id]);

    // Top Products
    const [topProducts] = await db.query(`
        SELECT p.name, SUM(si.quantity) as qty
        FROM sales_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.sale_date >= ? AND s.company_id = ?
        GROUP BY p.id
        ORDER BY qty DESC
        LIMIT 5
    `, [firstDayOfMonth, company_id]);
    
    // Get currency symbol
    const [company] = await db.query('SELECT currency FROM companies WHERE id = ?', [company_id]);
    const currency = company[0]?.currency || 'EUR';

    const ticketAvg = monthSales[0].count > 0 ? (monthSales[0].total / monthSales[0].count) : 0;

    // Calculate Growth
    const safeTotal = lastMonthSales[0].total || 0;
    const growth = safeTotal === 0 ? 100 : ((monthSales[0].total - safeTotal) / safeTotal) * 100;

    res.json({
        today: { total: todaySales[0].total || 0, count: todaySales[0].count },
        month: { 
            total: monthSales[0].total || 0, 
            count: monthSales[0].count,
            growth: growth.toFixed(1)
        },
        lastMonth: { total: lastMonthSales[0].total || 0 },
        ticketAvg: ticketAvg,
        topProducts,
        currency
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao obter dados do dashboard.' });
  }
};

const getForecast = async (req, res) => {
    try {
        const { company_id } = req.user;
        // Get last 30 days sales
        const [history] = await db.query(`
            SELECT DATE(sale_date) as date, SUM(total) as value
            FROM sales
            WHERE sale_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            AND company_id = ?
            GROUP BY DATE(sale_date)
            ORDER BY date ASC
        `, [company_id]);

        const dataPoints = history.map(h => ({ date: h.date, value: parseFloat(h.value) }));
        
        const last7Days = dataPoints.slice(-7);
        const avg = last7Days.reduce((acc, curr) => acc + curr.value, 0) / (last7Days.length || 1);
        
        const forecast = [];
        let nextDate = new Date();
        
        for (let i = 1; i <= 7; i++) {
            nextDate.setDate(nextDate.getDate() + 1);
            forecast.push({
                date: nextDate.toISOString().split('T')[0],
                value: avg
            });
        }

        const trend = avg > (dataPoints.length > 0 ? dataPoints[0].value : 0) ? 'UP' : 'FLAT';

        res.json({
            history: dataPoints,
            forecast,
            trend
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao gerar previsão.' });
    }
};

// RF05 - Performance by Seller
const getSellerPerformance = async (req, res) => {
    try {
        const { company_id } = req.user;
        const [sellers] = await db.query(`
            SELECT u.name, SUM(s.total) as total_sales, COUNT(s.id) as sales_count
            FROM sales s
            JOIN users u ON s.user_id = u.id
            WHERE s.company_id = ? AND s.sale_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY u.id
            ORDER BY total_sales DESC
        `, [company_id]);
        res.json(sellers);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter performance da equipa' });
    }
};

// RF07 - Top Customers
const getTopCustomers = async (req, res) => {
    try {
        const { company_id } = req.user;
        const [customers] = await db.query(`
            SELECT c.name, SUM(s.total) as total_spent, COUNT(s.id) as purchases
            FROM sales s
            JOIN customers c ON s.customer_id = c.id
            WHERE s.company_id = ?
            GROUP BY c.id
            ORDER BY total_spent DESC
            LIMIT 10
        `, [company_id]);
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter ranking de clientes' });
    }
};

module.exports = { getDashboardSummary, getForecast, getSellerPerformance, getTopCustomers };
