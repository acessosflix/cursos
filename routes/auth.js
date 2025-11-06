const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, level } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos' });
    }

    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erro no servidor' });
      }

      if (user) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const userLevel = level && [1, 2, 3].includes(parseInt(level)) ? parseInt(level) : 1;
      
      db.run(
        'INSERT INTO users (name, email, password, level) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, userLevel],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Erro ao criar usuário' });
          }

          const token = jwt.sign(
            { userId: this.lastID, email, level: userLevel, isAdmin: false },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          res.status(201).json({
            token,
            user: {
              id: this.lastID,
              name,
              email,
              level: userLevel,
              isAdmin: false
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erro no servidor' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, level: user.level, isAdmin: user.is_admin === 1 },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
        isAdmin: user.is_admin === 1
      }
    });
  });
});

// Get current user
router.get('/me', require('../middleware/auth').authenticate, (req, res) => {
  db.get('SELECT id, name, email, level, is_admin FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erro no servidor' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      level: user.level,
      isAdmin: user.is_admin === 1
    });
  });
});

module.exports = router;
