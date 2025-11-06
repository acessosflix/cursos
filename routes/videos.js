const express = require('express');
const db = require('../database/db');
const { authenticate, checkLevel } = require('../middleware/auth');

const router = express.Router();

// Get videos based on user level
router.get('/', authenticate, (req, res) => {
  const userLevel = req.userLevel;

  db.all(
    'SELECT * FROM videos WHERE level <= ? ORDER BY created_at DESC',
    [userLevel],
    (err, videos) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar vídeos' });
      }
      res.json(videos);
    }
  );
});

// Get single video
router.get('/:id', authenticate, (req, res) => {
  const videoId = req.params.id;
  const userLevel = req.userLevel;

  db.get(
    'SELECT * FROM videos WHERE id = ? AND level <= ?',
    [videoId, userLevel],
    (err, video) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar vídeo' });
      }

      if (!video) {
        return res.status(404).json({ error: 'Vídeo não encontrado ou sem permissão' });
      }

      res.json(video);
    }
  );
});

module.exports = router;
