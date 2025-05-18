import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

  return (
    <Container style={{ maxWidth: 600, marginTop: '2rem' }}>
      <Card className="text-center p-4">
        <h2>🎉 {t('Congratulations!')}</h2>
        <p>{t('You’ve successfully booked:')}</p>
        <Card.Img
          variant="top"
          src={event.image}
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