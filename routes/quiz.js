const express = require('express');
const db = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get random questions for a video (8 questions from ~20 pool)
router.get('/questions/:videoId', authenticate, (req, res) => {
  const videoId = req.params.videoId;

  db.all(
    'SELECT id, question, option_a, option_b, option_c, option_d FROM questions WHERE video_id = ?',
    [videoId],
    (err, questions) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar perguntas' });
      }

      if (questions.length === 0) {
        return res.status(404).json({ error: 'Nenhuma pergunta encontrada para este vídeo' });
      }

      // Shuffle and select 8 questions
      const shuffled = questions.sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, Math.min(8, questions.length));

      res.json(selectedQuestions);
    }
  );
});

// Submit quiz answers
router.post('/submit/:videoId', authenticate, (req, res) => {
  const { answers } = req.body; // Array of { questionId, answer }
  const userId = req.userId;
  const videoId = req.params.videoId;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Respostas inválidas' });
  }

  // Get correct answers
  const questionIds = answers.map(a => a.questionId);
  const placeholders = questionIds.map(() => '?').join(',');

  db.all(
    `SELECT id, correct_answer FROM questions WHERE id IN (${placeholders})`,
    questionIds,
    (err, correctAnswers) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao processar quiz' });
      }

      // Calculate score
      let correctCount = 0;
      const answerMap = {};
      answers.forEach(a => {
        answerMap[a.questionId] = a.answer;
      });

      correctAnswers.forEach(correct => {
        if (answerMap[correct.id] === correct.correct_answer) {
          correctCount++;
        }
      });

      const totalQuestions = answers.length;
      const score = Math.round((correctCount / totalQuestions) * 100);

      // Save quiz attempt
      db.run(
        `INSERT INTO quiz_attempts (user_id, video_id, score, total_questions, answers)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, videoId, score, totalQuestions, JSON.stringify(answers)],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Erro ao salvar tentativa' });
          }

          res.json({
            score,
            totalQuestions,
            correctCount,
            incorrectCount: totalQuestions - correctCount
          });
        }
      );
    }
  );
});

// Get quiz history for a video
router.get('/history/:videoId', authenticate, (req, res) => {
  const userId = req.userId;
  const videoId = req.params.videoId;

  db.all(
    'SELECT * FROM quiz_attempts WHERE user_id = ? AND video_id = ? ORDER BY created_at DESC',
    [userId, videoId],
    (err, attempts) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar histórico' });
      }
      res.json(attempts);
    }
  );
});

module.exports = router;
