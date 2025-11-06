import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState('1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password, parseInt(level));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <Container className="py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <Card className="card-custom">
              <Card.Body className="p-4">
                <h2 className="text-center mb-4">Cadastro</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Nível de Acesso</Form.Label>
                    <Form.Select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                    >
                      <option value="1">Nível 1 - Colaborador Iniciante</option>
                      <option value="2">Nível 2 - Colaborador Experiente</option>
                      <option value="3">Nível 3 - Gerente/Diretor</option>
                    </Form.Select>
                  </Form.Group>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 btn-custom"
                    disabled={loading}
                  >
                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                  </Button>
                </Form>
                <div className="text-center mt-3">
                  <Link to="/login">Já tem conta? Faça login</Link>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Register;
