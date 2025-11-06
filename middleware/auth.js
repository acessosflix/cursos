const jwt = require('jsonwebtoken');
const db = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userLevel = decoded.level;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware to check user level
const checkLevel = (requiredLevel) => {
  return (req, res, next) => {
    if (req.userLevel < requiredLevel) {
      return res.status(403).json({ error: 'Acesso negado. Nível insuficiente.' });
    }
    next();
  };
};

// Middleware to check admin
const checkAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

module.exports = { authenticate, checkLevel, checkAdmin, JWT_SECRET };
