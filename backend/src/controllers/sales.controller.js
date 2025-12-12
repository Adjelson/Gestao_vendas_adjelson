const db = require('../config/db');

const createSale = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { items, user_id, customer_id, channel } = req.body; 
    const { company_id } = req.user; 

    if (!items || items.length === 0) {
        throw new Error('Venda sem itens.');
    }

    // Calculate total
    const total = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    const saleChannel = channel || 'STORE';

    // Insert Sale header
    const [saleResult] = await connection.query(
        'INSERT INTO sales (total, user_id, company_id, sale_date, customer_id, channel) VALUES (?, ?, ?, NOW(), ?, ?)',
        [total, user_id, company_id, customer_id || null, saleChannel]
    );
    const saleId = saleResult.insertId;

    // Insert Sale Items
    const itemValues = items.map(item => [
        saleId, 
        item.product_id, 
        item.quantity, 
        item.unit_price, 
        item.quantity * item.unit_price
    ]);

    await connection.query(
        'INSERT INTO sales_items (sale_id, product_id, quantity, unit_price, line_total) VALUES ?',
        [itemValues]
    );

    await connection.commit();
    res.status(201).json({ message: 'Venda registada com sucesso', id: saleId, total });
  } catch (error) {
    await connection.rollback();
    console.error('Sale error:', error);
    res.status(500).json({ message: 'Erro ao registar venda: ' + error.message });
  } finally {
    connection.release();
  }
};

const listSales = async (req, res) => {
    try {
        const { startDate, endDate, seller_id, channel, min_total, max_total } = req.query;
        const { company_id } = req.user;

        let query = `
            SELECT s.*, u.name as user_name, c.name as customer_name 
            FROM sales s 
            LEFT JOIN users u ON s.user_id = u.id 
            LEFT JOIN customers c ON s.customer_id = c.id
            WHERE s.company_id = ?
        `;
        const params = [company_id];

        if (startDate && endDate) {
            query += ' AND s.sale_date BETWEEN ? AND ?';
            params.push(startDate + ' 00:00:00', endDate + ' 23:59:59'); 
        }

        if (seller_id) {
            query += ' AND s.user_id = ?';
            params.push(seller_id);
        }

        if (channel) {
            query += ' AND s.channel = ?';
            params.push(channel);
        }

        if (min_total) {
            query += ' AND s.total >= ?';
            params.push(min_total);
        }

        if (max_total) {
            query += ' AND s.total <= ?';
            params.push(max_total);
        }
        
        query += ' ORDER BY s.sale_date DESC LIMIT 500';

        const [sales] = await db.query(query, params);
        res.json(sales);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao listar vendas.' });
    }
};

module.exports = { createSale, listSales };
