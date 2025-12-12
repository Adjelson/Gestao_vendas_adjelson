const db = require('../config/db');

const listCustomers = async (req, res) => {
    try {
        const { company_id } = req.user;
        const [customers] = await db.query('SELECT * FROM customers WHERE company_id = ? ORDER BY name ASC', [company_id]);
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar clientes' });
    }
};

const createCustomer = async (req, res) => {
    try {
        const { name, nif, email, phone } = req.body;
        const { company_id } = req.user;
        
        const [result] = await db.query(
            'INSERT INTO customers (name, nif, email, phone, company_id) VALUES (?, ?, ?, ?, ?)',
            [name, nif, email, phone, company_id]
        );
        res.status(201).json({ id: result.insertId, name, nif, email, phone });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar cliente' });
    }
};

module.exports = { listCustomers, createCustomer };
