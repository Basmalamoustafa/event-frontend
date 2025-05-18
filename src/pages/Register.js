import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Card, Button, Alert, Container, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import API from '../api';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/register', form);
      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('userRole', form.role);
      toast.success(t('Account created successfully!'));
      if (form.role === 'admin') {
        navigate('/admin/events');
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.msg || t('Registration failed');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ maxWidth: 400, marginTop: '2rem' }}>
      <Card className="p-4">
        <h2 className="mb-4 text-center">{t('Create Account')}</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="registerName">
            <Form.Label>{t('Name')}</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder={t('Enter your name')}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerEmail">
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

          <Form.Group className="mb-3" controlId="registerPassword">
            <Form.Label>{t('Password')}</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder={t('Choose a strong password')}
            />
          </Form.Group>

          <Button type="submit" className="w-100" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : t('Register')}
          </Button>
        </Form>

        <div className="mt-3 text-center">
          {t('Already have an account?')}{' '}
          <Link to="/login">{t('Log In')}</Link>
        </div>
      </Card>
    </Container>
  );
};

export default Register;