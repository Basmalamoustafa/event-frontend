import React, { useEffect, useState } from 'react';
import { Card, Container, Row, Col, Alert, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import API from '../api';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const MyBookings = () => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error(t('Please log in to view your bookings.'));
        return;
      }

      const res = await API.get('/bookings/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      const msg = err.response?.data?.msg || t('Failed to fetch bookings.');
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm(t('Are you sure you want to delete this booking?'))) return;

    try {
      const token = localStorage.getItem('authToken');
      await API.delete(`/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(t('Booking deleted successfully.'));
      setBookings(bookings.filter((b) => b._id !== bookingId));
    } catch (err) {
      console.error('Failed to delete booking:', err);
      const msg = err.response?.data?.msg || t('Failed to delete booking.');
      toast.error(msg);
    }
  };

  // Helper to get image URL from event.image (MongoDB)
  const getImageUrl = (image) => {
    if (!image) return '/placeholder.jpg';
    if (typeof image === 'string') {
      // If it's a full URL or relative path
      if (image.startsWith('http') || image.startsWith('/upload')) return image;
      // If it's a MongoDB ObjectId string
      if (image.length === 24) return `${API_BASE_URL}/upload/image/${image}`;
      return '/placeholder.jpg';
    }
    if (image._id) return `${API_BASE_URL}/upload/image/${image._id}`;
    return '/placeholder.jpg';
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">{t('Your Bookings')}</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {bookings.length === 0 && !error ? (
        <Alert variant="info">{t("You haven't booked any events yet.")}</Alert>
      ) : (
        <Row>
          {bookings.map((booking) => {
            if (!booking.event) {
              // Event deleted/orphan booking
              return (
                <Col md={6} lg={4} key={booking._id} className="mb-4">
                  <Card border="danger">
                    <Card.Body>
                      <Card.Title>{t('Event no longer exists')}</Card.Title>
                      <Card.Text>
                        {t('The event you booked has been deleted by the admin.')}
                      </Card.Text>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(booking._id)}
                      >
                        {t('Delete Booking')}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            }

            // Normal booking
            return (
              <Col md={6} lg={4} key={booking._id} className="mb-4">
                <Card>
                  <Card.Img
                    variant="top"
                    src={getImageUrl(booking.event.image)}
                    alt={booking.event.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={e => { e.target.onerror = null; e.target.src = '/placeholder.jpg'; }}
                  />
                  <Card.Body>
                    <Card.Title>{booking.event.name}</Card.Title>
                    <Card.Text>{booking.event.description}</Card.Text>
                    <p><strong>{t('Venue')}:</strong> {booking.event.venue}</p>
                    <p><strong>{t('Date')}:</strong> {new Date(booking.event.date).toLocaleString()}</p>
                    <p><strong>{t('Price')}:</strong> ${booking.event.price}</p>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default MyBookings;