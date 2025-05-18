import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const Congratulations = () => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const navigate = useNavigate();

  // If someone lands here without state, redirect back home
  if (!state || !state.event) {
    navigate('/');
    return null;
  }

  const { event } = state;

  // Helper to get image URL from event.image (MongoDB)
  const getImageUrl = (image) => {
    if (!image) return '/placeholder.jpg';
    if (typeof image === 'string') return image;
    if (image._id) return `${API_BASE_URL}/api/upload/image/${image._id}`;
    return '/placeholder.jpg';
  };

  return (
    <Container style={{ maxWidth: 600, marginTop: '2rem' }}>
      <Card className="text-center p-4">
        <h2>🎉 {t('Congratulations!')}</h2>
        <p>{t('You’ve successfully booked:')}</p>
        <Card.Img
          variant="top"
          src={getImageUrl(event.image)}
          style={{ height: '200px', objectFit: 'cover', margin: '0 auto', width: '100%' }}
        />
        <Card.Body>
          <Card.Title>{event.name}</Card.Title>
          <Card.Text>{event.description}</Card.Text>
          <p><strong>{t('Date')}:</strong> {new Date(event.date).toLocaleString()}</p>
          <p><strong>{t('Venue')}:</strong> {event.venue}</p>
          <p><strong>{t('Price')}:</strong> ${event.price}</p>
          <Button onClick={() => navigate('/')} className="mt-3">
            {t('Back to Events')}
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Congratulations;