import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, ProgressBar, Alert } from 'react-bootstrap';
import YouTube from 'react-youtube';
import axios from 'axios';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [progress, setProgress] = useState({ progressPercentage: 0, lastPosition: 0, completed: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const playerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const [canAccessQuiz, setCanAccessQuiz] = useState(false);

  useEffect(() => {
    fetchVideo();
    fetchProgress();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [id]);

  const fetchVideo = async () => {
    try {
      const response = await axios.get(`/api/videos/${id}`);
      setVideo(response.data);
    } catch (err) {
      setError('Erro ao carregar vídeo');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await axios.get(`/api/progress/${id}`);
      setProgress(response.data);
      setCanAccessQuiz(response.data.progressPercentage >= 90 || response.data.completed);
    } catch (err) {
      console.error('Erro ao carregar progresso');
    }
  };

  const saveProgress = async (progressPercentage, currentTime, duration) => {
    try {
      await axios.post(`/api/progress/${id}`, {
        progressPercentage,
        lastPosition: currentTime,
        completed: progressPercentage >= 90
      });
      
      if (progressPercentage >= 90 && !canAccessQuiz) {
        setCanAccessQuiz(true);
      }
    } catch (err) {
      console.error('Erro ao salvar progresso');
    }
  };

  const handleReady = (event) => {
    playerRef.current = event.target;
    
    // Resume from last position
    if (progress.lastPosition > 0) {
      event.target.seekTo(progress.lastPosition);
    }

    // Track progress every 5 seconds
    progressIntervalRef.current = setInterval(() => {
      const currentTime = event.target.getCurrentTime();
      const duration = event.target.getDuration();
      
      if (duration > 0) {
        const progressPercentage = (currentTime / duration) * 100;
        saveProgress(progressPercentage, currentTime, duration);
        setProgress(prev => ({ ...prev, progressPercentage }));
      }
    }, 5000);
  };

  const handleStateChange = (event) => {
    // Save progress when video ends
    if (event.data === 0) {
      const currentTime = event.target.getCurrentTime();
      const duration = event.target.getDuration();
      if (duration > 0) {
        saveProgress(100, currentTime, duration);
        setProgress(prev => ({ ...prev, progressPercentage: 100, completed: true }));
        setCanAccessQuiz(true);
      }
    }
  };

  const opts = {
    height: '500',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1
    }
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

  if (error || !video) {
    return (
      <div className="main-content">
        <Container className="py-5">
          <Alert variant="danger">{error || 'Vídeo não encontrado'}</Alert>
          <Button onClick={() => navigate('/dashboard')}>Voltar</Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="main-content">
      <Container className="py-5">
        <Card className="card-custom">
          <Card.Body>
            <h2 className="mb-4">{video.title}</h2>
            {video.description && (
              <p className="text-muted mb-4">{video.description}</p>
            )}
            
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span>Progresso</span>
                <span>{Math.round(progress.progressPercentage)}%</span>
              </div>
              <ProgressBar
                now={progress.progressPercentage}
                className="progress-bar-custom"
                variant={progress.progressPercentage >= 90 ? 'success' : 'primary'}
              />
            </div>

            <div className="video-container mb-4">
              <YouTube
                videoId={video.youtube_id}
                opts={opts}
                onReady={handleReady}
                onStateChange={handleStateChange}
              />
            </div>

            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Voltar
              </Button>
              {canAccessQuiz && (
                <Button
                  variant="success"
                  onClick={() => navigate(`/quiz/${id}`)}
                >
                  Fazer Quiz
                </Button>
              )}
              {!canAccessQuiz && (
                <Alert variant="info" className="mb-0 flex-grow-1">
                  Assista pelo menos 90% do vídeo para acessar o quiz.
                </Alert>
              )}
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default VideoPlayer;
