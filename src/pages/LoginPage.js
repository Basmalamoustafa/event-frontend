import React, { useState } from 'react';
import { Form, Card, Button, Alert, Container, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', {
        email: form.email,
        password: form.password
      });

      const { token, user } = res.data;
      const { role } = user;

      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', role);
      toast.success(t('Logged in successfully as', { role: t(role) }));

      if (role === 'admin') {
        navigate('/admin/events');
      } else {
        navigate('/');
      }

    } catch (err) {
      const msg = err.response?.data?.msg || t('Failed to log in. Please check your credentials.');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ maxWidth: 400, marginTop: '2rem' }}>
      <Card className="p-4">
        <h2 className="mb-4 text-center">{t('Log In')}</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="loginEmail">
            <Form.Label>{t('Email')}</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder={t('Enter your email')}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="loginPassword">
            <Form.Label>{t('Password')}</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder={t('Enter your password')}
            />
          </Form.Group>

          <Button type="submit" className="w-100" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : t('Log In')}
          </Button>
        </Form>

        <div className="mt-3 text-center">
          {t('Don’t have an account?')}{' '}
          <Link to="/register">{t('Register')}</Link>
        </div>
      </Card>
    </Container>
  );
};

export default Login;