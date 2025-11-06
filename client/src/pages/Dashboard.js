import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get('/api/videos');
      setVideos(response.data);
    } catch (err) {
      setError('Erro ao carregar vídeos');
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadge = (level) => {
    const variants = {
      1: 'success',
      2: 'warning',
      3: 'danger'
    };
    return <Badge bg={variants[level]}>Nível {level}</Badge>;
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
        <h1 className="mb-4">Bem-vindo, {user?.name}!</h1>
        <p className="lead mb-4">
          Seu nível de acesso: <strong>Nível {user?.level}</strong>
        </p>

        {error && <Alert variant="danger">{error}</Alert>}

        {videos.length === 0 ? (
          <Alert variant="info">
            Nenhum vídeo disponível para seu nível de acesso.
          </Alert>
        ) : (
          <Row>
            {videos.map((video) => (
              <Col key={video.id} md={6} lg={4} className="mb-4">
                <Card className="card-custom h-100">
                  <div className="video-container">
                    <img
                      src={`https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-100"
                      style={{ objectFit: 'cover', height: '200px' }}
                    />
                  </div>
                  <Card.Body>
                    <Card.Title>{video.title}</Card.Title>
                    <Card.Text className="text-muted small">
                      {video.description || 'Sem descrição'}
                    </Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                      {getLevelBadge(video.level)}
                      <Link
                        to={`/video/${video.id}`}
                        className="btn btn-primary btn-custom"
                      >
                        Assistir
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Dashboard;
