import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import axios from 'axios';

const Quiz = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [videoId]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`/api/quiz/questions/${videoId}`);
      setQuestions(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar perguntas');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (Object.keys(answers).length < questions.length) {
      setError('Por favor, responda todas as perguntas');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer
      }));

      const response = await axios.post(`/api/quiz/submit/${videoId}`, {
        answers: answersArray
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao enviar respostas');
    } finally {
      setSubmitting(false);
    }
  };

  const getChartData = () => {
    if (!result) return [];
    return [
      { name: 'Corretas', value: result.correctCount, color: '#28a745' },
      { name: 'Incorretas', value: result.incorrectCount, color: '#dc3545' }
    ];
  };

  if (loading) {
    return (
      <div className="main-content">
        <Container className="py-5">
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Carregando...</span>
            </Spinner>
          </div>
        </Container>
      </div>
    );
  }

  if (result) {
    const chartData = getChartData();
    return (
      <div className="main-content">
        <Container className="py-5">
          <Card className="card-custom">
            <Card.Body className="text-center">
              <h2 className="mb-4">Resultado do Quiz</h2>
              <div className="mb-4">
                <h1 className={`display-4 ${result.score >= 70 ? 'text-success' : result.score >= 50 ? 'text-warning' : 'text-danger'}`}>
                  {result.score}%
                </h1>
                <p className="lead">
                  Você acertou {result.correctCount} de {result.totalQuestions} perguntas
                </p>
              </div>

              {chartData.length > 0 && (
                <div style={{ height: '300px', marginBottom: '2rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="d-flex gap-2 justify-content-center">
                <Button variant="primary" onClick={() => navigate('/dashboard')}>
                  Voltar ao Dashboard
                </Button>
                <Button variant="secondary" onClick={() => window.location.reload()}>
                  Tentar Novamente
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="main-content">
      <Container className="py-5">
        <Card className="card-custom">
          <Card.Body>
            <h2 className="mb-4">Quiz</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              {questions.map((question, index) => (
                <Card key={question.id} className="mb-4">
                  <Card.Body>
                    <h5 className="mb-3">
                      Pergunta {index + 1}: {question.question}
                    </h5>
                    <Form.Group>
                      {['option_a', 'option_b', 'option_c', 'option_d'].map((option) => (
                        <Form.Check
                          key={option}
                          type="radio"
                          id={`${question.id}-${option}`}
                          name={`question-${question.id}`}
                          label={question[option]}
                          value={question[option]}
                          checked={answers[question.id] === question[option]}
                          onChange={() => handleAnswerChange(question.id, question[option])}
                          className="mb-2"
                        />
                      ))}
                    </Form.Group>
                  </Card.Body>
                </Card>
              ))}

              <div className="d-flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="btn-custom"
                  disabled={submitting || Object.keys(answers).length < questions.length}
                >
                  {submitting ? 'Enviando...' : 'Enviar Respostas'}
                </Button>
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                  Cancelar
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Quiz;
