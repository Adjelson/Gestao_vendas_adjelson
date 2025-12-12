const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, company_id, permissions? }
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido ou expirado.' });
  }
};

const verifyAdmin = (req, res, next) => {
  // Allow SUPER_ADMIN or COMPANY_ADMIN
  if (req.user && (req.user.role === 'SUPER_ADMIN' || req.user.role === 'COMPANY_ADMIN')) {
    next();
  } else {
    res.status(403).json({ message: 'Acesso restrito a administradores.' });
  }
};

const verifyCompany = (req, res, next) => {
    if (!req.user.company_id && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Utilizador não associado a uma empresa.' });
    }
    next();
};

const checkPermission = (permission) => {
    return (req, res, next) => {
        // Just rely on permissions map. Admin roles should have their permissions populated in DB.
        const userPerms = req.user.permissions || {};

        if (req.user.role === 'SUPER_ADMIN') {
             return next(); // Super Admin bypass
        }

        if (userPerms[permission]) {
            next();
        } else {
            res.status(403).json({ message: `Sem permissão: ${permission}` });
        }
    };
};

module.exports = { verifyToken, verifyAdmin, verifyCompany, checkPermission };
