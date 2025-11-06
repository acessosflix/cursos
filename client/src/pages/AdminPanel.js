import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Alert,
  Tabs,
  Tab,
  Badge
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [users, setUsers] = useState([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Video form state
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    youtubeId: '',
    level: '1'
  });

  // Question form state
  const [questionForm, setQuestionForm] = useState({
    videoId: '',
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: ''
  });

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchData();
    } else {
      navigate('/dashboard');
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [videosRes, usersRes] = await Promise.all([
        axios.get('/api/admin/videos'),
        axios.get('/api/admin/users')
      ]);
      setVideos(videosRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (videoId) => {
    try {
      const response = await axios.get(`/api/admin/questions/${videoId}`);
      setQuestions(response.data);
    } catch (err) {
      console.error('Erro ao buscar perguntas');
    }
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/admin/videos', videoForm);
      setSuccess('Vídeo criado com sucesso!');
      setShowVideoModal(false);
      setVideoForm({ title: '', description: '', youtubeId: '', level: '1' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar vídeo');
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/admin/questions', questionForm);
      setSuccess('Pergunta criada com sucesso!');
      setShowQuestionModal(false);
      setQuestionForm({
        videoId: '',
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: ''
      });
      if (selectedVideo) {
        fetchQuestions(selectedVideo.id);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar pergunta');
    }
  };

  const handleDeleteVideo = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este vídeo?')) {
      try {
        await axios.delete(`/api/admin/videos/${id}`);
        setSuccess('Vídeo deletado com sucesso!');
        fetchData();
      } catch (err) {
        setError('Erro ao deletar vídeo');
      }
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta pergunta?')) {
      try {
        await axios.delete(`/api/admin/questions/${id}`);
        setSuccess('Pergunta deletada com sucesso!');
        if (selectedVideo) {
          fetchQuestions(selectedVideo.id);
        }
      } catch (err) {
        setError('Erro ao deletar pergunta');
      }
    }
  };

  const openQuestionModal = (video) => {
    setSelectedVideo(video);
    setQuestionForm({ ...questionForm, videoId: video.id });
    fetchQuestions(video.id);
    setShowQuestionModal(true);
  };

  if (loading) {
    return (
      <div className="main-content">
        <Container className="py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="main-content">
      <Container className="py-5">
        <h1 className="mb-4">Painel Administrativo</h1>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Tabs defaultActiveKey="videos" className="mb-4">
          <Tab eventKey="videos" title="Vídeos">
            <Card className="card-custom mt-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3>Gerenciar Vídeos</h3>
                  <Button
                    variant="primary"
                    onClick={() => setShowVideoModal(true)}
                  >
                    + Novo Vídeo
                  </Button>
                </div>

                <Table responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Título</th>
                      <th>YouTube ID</th>
                      <th>Nível</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((video) => (
                      <tr key={video.id}>
                        <td>{video.id}</td>
                        <td>{video.title}</td>
                        <td>{video.youtube_id}</td>
                        <td>
                          <Badge bg={video.level === 1 ? 'success' : video.level === 2 ? 'warning' : 'danger'}>
                            Nível {video.level}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="info"
                            size="sm"
                            className="me-2"
                            onClick={() => openQuestionModal(video)}
                          >
                            Perguntas
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteVideo(video.id)}
                          >
                            Deletar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="users" title="Usuários">
            <Card className="card-custom mt-3">
              <Card.Body>
                <h3 className="mb-3">Usuários Cadastrados</h3>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Nível</th>
                      <th>Admin</th>
                      <th>Cadastrado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <Badge bg={user.level === 1 ? 'success' : user.level === 2 ? 'warning' : 'danger'}>
                            Nível {user.level}
                          </Badge>
                        </td>
                        <td>{user.is_admin ? 'Sim' : 'Não'}</td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>

        {/* Video Modal */}
        <Modal show={showVideoModal} onHide={() => setShowVideoModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Novo Vídeo</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleVideoSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Título</Form.Label>
                <Form.Control
                  type="text"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>YouTube ID</Form.Label>
                <Form.Control
                  type="text"
                  value={videoForm.youtubeId}
                  onChange={(e) => setVideoForm({ ...videoForm, youtubeId: e.target.value })}
                  placeholder="Ex: dQw4w9WgXcQ"
                  required
                />
                <Form.Text className="text-muted">
                  Apenas o ID do vídeo (não a URL completa)
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nível</Form.Label>
                <Form.Select
                  value={videoForm.level}
                  onChange={(e) => setVideoForm({ ...videoForm, level: e.target.value })}
                >
                  <option value="1">Nível 1</option>
                  <option value="2">Nível 2</option>
                  <option value="3">Nível 3</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowVideoModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Criar
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Question Modal */}
        <Modal show={showQuestionModal} onHide={() => setShowQuestionModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              Perguntas - {selectedVideo?.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  setQuestionForm({
                    ...questionForm,
                    question: '',
                    optionA: '',
                    optionB: '',
                    optionC: '',
                    optionD: '',
                    correctAnswer: ''
                  });
                }}
              >
                + Nova Pergunta
              </Button>
            </div>

            <Form onSubmit={handleQuestionSubmit} className="mb-4">
              <Form.Group className="mb-2">
                <Form.Label>Pergunta</Form.Label>
                <Form.Control
                  type="text"
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Opção A</Form.Label>
                <Form.Control
                  type="text"
                  value={questionForm.optionA}
                  onChange={(e) => setQuestionForm({ ...questionForm, optionA: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Opção B</Form.Label>
                <Form.Control
                  type="text"
                  value={questionForm.optionB}
                  onChange={(e) => setQuestionForm({ ...questionForm, optionB: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Opção C</Form.Label>
                <Form.Control
                  type="text"
                  value={questionForm.optionC}
                  onChange={(e) => setQuestionForm({ ...questionForm, optionC: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Opção D</Form.Label>
                <Form.Control
                  type="text"
                  value={questionForm.optionD}
                  onChange={(e) => setQuestionForm({ ...questionForm, optionD: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Resposta Correta</Form.Label>
                <Form.Select
                  value={questionForm.correctAnswer}
                  onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value={questionForm.optionA}>A: {questionForm.optionA}</option>
                  <option value={questionForm.optionB}>B: {questionForm.optionB}</option>
                  <option value={questionForm.optionC}>C: {questionForm.optionC}</option>
                  <option value={questionForm.optionD}>D: {questionForm.optionD}</option>
                </Form.Select>
              </Form.Group>
              <Button type="submit" variant="primary">
                Adicionar Pergunta
              </Button>
            </Form>

            <hr />

            <h5>Perguntas Existentes ({questions.length})</h5>
            {questions.length === 0 ? (
              <p className="text-muted">Nenhuma pergunta cadastrada ainda.</p>
            ) : (
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>Pergunta</th>
                    <th>Resposta Correta</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q.id}>
                      <td>{q.question}</td>
                      <td>{q.correct_answer}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteQuestion(q.id)}
                        >
                          Deletar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowQuestionModal(false)}>
              Fechar
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default AdminPanel;
