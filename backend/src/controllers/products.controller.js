const db = require('../config/db');

const listProducts = async (req, res) => {
  try {
    const { company_id } = req.user;
    const [products] = await db.query('SELECT * FROM products WHERE company_id = ? AND is_active = 1', [company_id]);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar produtos.' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const { company_id } = req.user;
    
    if (!name || price === undefined) {
        return res.status(400).json({ message: 'Nome e preço são obrigatórios.' });
    }

    const [result] = await db.query(
      'INSERT INTO products (name, price, category, company_id) VALUES (?, ?, ?, ?)',
      [name, price, category, company_id]
    );

    res.status(201).json({ id: result.insertId, name, price, category });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar produto.' });
  }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, category, is_active } = req.body;
        const { company_id } = req.user;
        
        // Check ownership
        const [exists] = await db.query('SELECT id FROM products WHERE id = ? AND company_id = ?', [id, company_id]);
        if (exists.length === 0) return res.status(404).json({ message: 'Produto não encontrado.' });
        
        await db.query(
            'UPDATE products SET name = ?, price = ?, category = ?, is_active = ? WHERE id = ?',
            [name, price, category, is_active, id]
        );
        
        res.json({ message: 'Produto atualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar produto.' });
    }
};

module.exports = { listProducts, createProduct, updateProduct };
