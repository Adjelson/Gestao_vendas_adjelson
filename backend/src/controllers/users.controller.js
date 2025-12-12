const db = require('../config/db');
const bcrypt = require('bcryptjs');

const listUsers = async (req, res) => {
  try {
    const { company_id } = req.user;
    // Only list users from the same company
    const [users] = await db.query('SELECT id, name, email, role, is_active, permissions FROM users WHERE company_id = ?', [company_id]);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar utilizadores.' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;
    const { company_id } = req.user; // User created belongs to admin's company
    
    // Validate role hierarchy (Company Admin can only create Employee or Company Admin)
    if (req.user.role === 'COMPANY_ADMIN' && role === 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Não pode criar Super Admins.' });
    }

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Dados incompletos.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    const permsJson = JSON.stringify(permissions || {});

    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role, permissions, company_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hash, role || 'EMPLOYEE', permsJson, company_id]
    );

    res.status(201).json({ id: result.insertId, name, email, role });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Email já registado.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar utilizador.' });
  }
};

const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_id } = req.user;
        
        // Ensure user belongs to same company
        const [users] = await db.query('SELECT is_active FROM users WHERE id = ? AND company_id = ?', [id, company_id]);
        
        if (users.length === 0) return res.status(404).json({ message: 'Utilizador não encontrado' });

        const newState = users[0].is_active ? 0 : 1;
        await db.query('UPDATE users SET is_active = ? WHERE id = ?', [newState, id]);
        
        res.json({ message: `Estado alterado para ${newState ? 'ativo' : 'inativo'}` });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao associar estado.' });
    }
};

module.exports = { listUsers, createUser, toggleUserStatus };
