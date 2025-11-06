const express = require('express');
const db = require('../database/db');
const { authenticate, checkAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticate);
router.use(checkAdmin);

// Get all videos
router.get('/videos', (req, res) => {
  db.all('SELECT * FROM videos ORDER BY created_at DESC', (err, videos) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar vídeos' });
    }
    res.json(videos);
  });
});

// Create video
router.post('/videos', (req, res) => {
  const { title, description, youtubeId, level } = req.body;

  if (!title || !youtubeId) {
    return res.status(400).json({ error: 'Título e ID do YouTube são obrigatórios' });
  }

  const videoLevel = level && [1, 2, 3].includes(parseInt(level)) ? parseInt(level) : 1;

  db.run(
    'INSERT INTO videos (title, description, youtube_id, level) VALUES (?, ?, ?, ?)',
    [title, description || '', youtubeId, videoLevel],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao criar vídeo' });
      }
      res.status(201).json({ id: this.lastID, title, description, youtubeId, level: videoLevel });
    }
  );
});

// Update video
router.put('/videos/:id', (req, res) => {
  const { title, description, youtubeId, level } = req.body;
  const videoId = req.params.id;

  db.run(
    'UPDATE videos SET title = ?, description = ?, youtube_id = ?, level = ? WHERE id = ?',
    [title, description, youtubeId, level, videoId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar vídeo' });
      }
      res.json({ success: true });
    }
  );
});

// Delete video
router.delete('/videos/:id', (req, res) => {
  const videoId = req.params.id;

  db.run('DELETE FROM videos WHERE id = ?', [videoId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar vídeo' });
    }
    res.json({ success: true });
  });
});

// Get questions for a video
router.get('/questions/:videoId', (req, res) => {
  const videoId = req.params.videoId;

  db.all('SELECT * FROM questions WHERE video_id = ?', [videoId], (err, questions) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar perguntas' });
    }
    res.json(questions);
  });
});

// Create question
router.post('/questions', (req, res) => {
  const { videoId, question, optionA, optionB, optionC, optionD, correctAnswer } = req.body;

  if (!videoId || !question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  db.run(
    `INSERT INTO questions (video_id, question, option_a, option_b, option_c, option_d, correct_answer)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [videoId, question, optionA, optionB, optionC, optionD, correctAnswer],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao criar pergunta' });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Update question
router.put('/questions/:id', (req, res) => {
  const { question, optionA, optionB, optionC, optionD, correctAnswer } = req.body;
  const questionId = req.params.id;

  db.run(
    `UPDATE questions SET question = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ?
     WHERE id = ?`,
    [question, optionA, optionB, optionC, optionD, correctAnswer, questionId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar pergunta' });
      }
      res.json({ success: true });
    }
  );
});

// Delete question
router.delete('/questions/:id', (req, res) => {
  const questionId = req.params.id;

  db.run('DELETE FROM questions WHERE id = ?', [questionId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar pergunta' });
    }
    res.json({ success: true });
  });
});

// Get all users
router.get('/users', (req, res) => {
  db.all('SELECT id, name, email, level, is_admin, created_at FROM users', (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
    res.json(users);
  });
});

// Get user progress
router.get('/users/:userId/progress', (req, res) => {
  const userId = req.params.userId;

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
