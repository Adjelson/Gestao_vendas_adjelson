const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e password são obrigatórios.' });
    }

    // Join with Companies to get status/currency if needed
    const [users] = await db.query(`
        SELECT u.*, c.is_active as company_active 
        FROM users u 
        LEFT JOIN companies c ON u.company_id = c.id 
        WHERE u.email = ? AND u.is_active = 1
    `, [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const user = users[0];

    // Check if company is active
    if (user.company_id && user.company_active === 0) {
        return res.status(403).json({ message: 'Empresa inativa. Contacte o suporte.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Fetch Granular Permissions
    let permissions = {};
    if (user.role_id) {
        const [permsResult] = await db.query(`
            SELECT p.code 
            FROM permissions p 
            JOIN role_permissions rp ON p.id = rp.permission_id 
            WHERE rp.role_id = ?
        `, [user.role_id]);
        
        // Convert to object for easier checking: { 'SALES_CREATE': true, ... }
        permissions = permsResult.reduce((acc, curr) => ({ ...acc, [curr.code]: true }), {});
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, // Keep for backward compat for now, but rely on permissions
        role_id: user.role_id,
        name: user.name,
        company_id: user.company_id,
        permissions: permissions 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
        permissions: permissions
      }
    });

    // ... existing login code ...
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

const registerCompany = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { companyName, nif, adminName, email, password, packageId } = req.body;

        if (!companyName || !nif || !adminName || !email || !password) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        await connection.beginTransaction();

        // 1. Check if user already exists
        const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Este email já está registado.' });
        }

        // 2. Check if company NIF exists (Optional but good)
        const [existingCompany] = await connection.query('SELECT id FROM companies WHERE nif = ?', [nif]);
        if (existingCompany.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Uma empresa com este NIF já existe.' });
        }

        // 3. Create Company
        // Note: address and currency are defaults for now as they aren't in the form
        const [compRes] = await connection.query(
            "INSERT INTO companies (name, nif, address, currency) VALUES (?, ?, 'Sede', 'EUR')",
            [companyName, nif]
        );
        const companyId = compRes.insertId;

        // 4. Find COMPANY_ADMIN role
        const [roles] = await connection.query("SELECT id FROM roles WHERE name = 'COMPANY_ADMIN'");
        let roleId = null;
        if (roles.length > 0) {
            roleId = roles[0].id;
        } else {
             // Fallback or error? For now assume it exists or use a default if your seed guarantees it.
             // If not found, transaction should fail or handle gracefully.
             // We'll log a warning and proceed if possible, but role is crucial.
             // Actually, let's try to find any role or fail.
             await connection.rollback();
             return res.status(500).json({ message: 'Erro de configuração: Role COMPANY_ADMIN não encontrada.' });
        }

        // 5. Create Admin User
        const passwordHash = await bcrypt.hash(password, 10);
        await connection.query(
            'INSERT INTO users (name, email, password_hash, role, role_id, company_id, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
            [adminName, email, passwordHash, 'COMPANY_ADMIN', roleId, companyId]
        );

        await connection.commit();

        res.status(201).json({ message: 'Empresa registada com sucesso!' });

    } catch (error) {
        await connection.rollback();
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Erro ao registar empresa.' });
    } finally {
        connection.release();
    }
};

module.exports = { login, registerCompany };
