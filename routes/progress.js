const express = require('express');
const db = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Save video progress
router.post('/:videoId', authenticate, (req, res) => {
  const { progressPercentage, lastPosition, completed } = req.body;
  const userId = req.userId;
  const videoId = req.params.videoId;

  db.run(
    `INSERT INTO video_progress (user_id, video_id, progress_percentage, last_position, completed)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, video_id) DO UPDATE SET
     progress_percentage = excluded.progress_percentage,
     last_position = excluded.last_position,
     completed = excluded.completed`,
    [userId, videoId, progressPercentage || 0, lastPosition || 0, completed ? 1 : 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao salvar progresso' });
      }
      res.json({ success: true });
    }
  );
});

// Get video progress
router.get('/:videoId', authenticate, (req, res) => {
  const userId = req.userId;
  const videoId = req.params.videoId;

  db.get(
    'SELECT * FROM video_progress WHERE user_id = ? AND video_id = ?',
    [userId, videoId],
    (err, progress) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar progresso' });
      }

      if (!progress) {
        return res.json({ progressPercentage: 0, lastPosition: 0, completed: false });
      }

      res.json({
        progressPercentage: progress.progress_percentage,
        lastPosition: progress.last_position,
        completed: progress.completed === 1
      });
    }
  );
});

// Get all user progress
router.get('/', authenticate, (req, res) => {
  const userId = req.userId;

  db.all(
    `SELECT vp.*, v.title, v.youtube_id 
     FROM video_progress vp
     JOIN videos v ON vp.video_id = v.id
     WHERE vp.user_id = ?`,
    [userId],
    (err, progress) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar progresso' });
      }
      res.json(progress);
    }
  );
});

module.exports = router;
